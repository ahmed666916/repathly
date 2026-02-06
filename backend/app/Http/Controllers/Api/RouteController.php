<?php

namespace App\Http\Controllers\Api;

use App\Enums\RouteStatus;
use App\Enums\StopType;
use App\Http\Controllers\Controller;
use App\Http\Requests\Route\CreateRouteRequest;
use App\Http\Requests\Route\UpdateRouteRequest;
use App\Models\Route;
use App\Models\RouteProfileSnapshot;
use App\Models\RouteStop;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RouteController extends Controller
{
    use ApiResponse;

    /**
     * Generate a route preview without saving.
     *
     * @param CreateRouteRequest $request
     * @return JsonResponse
     */
    public function preview(CreateRouteRequest $request): JsonResponse
    {
        try {
            $user = $request->user();

            // Build route data
            $routeData = $this->buildRouteData($request, $user->id);

            // Add waypoints if provided
            $stops = $this->buildStopsFromRequest($request);

            // TODO: Call external routing service to get directions and suggested stops
            // For now, return the route structure without actual routing

            return $this->success([
                'route' => $this->formatRouteForResponse($routeData),
                'stops' => $stops,
                'profile' => [
                    'travelStyle' => $user->profile?->travel_style?->value ?? 'balanced',
                    'detourTolerance' => $user->profile?->detour_tolerance?->value ?? 'medium',
                    'stopIntensity' => $user->profile?->stop_intensity?->value ?? 'moderate',
                ],
            ], 'Rota önizlemesi oluşturuldu.');

        } catch (\Exception $e) {
            return $this->error('Rota önizlemesi oluşturulurken bir hata oluştu.', 500, $e->getMessage());
        }
    }

    /**
     * Create and save a new route.
     *
     * @param CreateRouteRequest $request
     * @return JsonResponse
     */
    public function store(CreateRouteRequest $request): JsonResponse
    {
        try {
            $user = $request->user();

            // Build route data
            $routeData = $this->buildRouteData($request, $user->id);
            $routeData['is_saved'] = $request->boolean('save', true);
            $routeData['status'] = RouteStatus::Generated->value;
            $routeData['generated_at'] = now();

            // Create route
            $route = Route::create($routeData);

            // Create stops from waypoints
            $this->createStopsForRoute($route, $request);

            // Create profile snapshot
            RouteProfileSnapshot::createFromUser($route->id, $user);

            // Load relationships
            $route->load(['stops', 'profileSnapshot']);

            return $this->success([
                'route' => $this->formatRouteForResponse($route->toArray()),
                'stops' => $route->stops->map(fn($s) => $this->formatStopForResponse($s->toArray())),
                'profileSnapshot' => $route->profileSnapshot ? [
                    'travelStyle' => $route->profileSnapshot->travel_style->value,
                    'detourTolerance' => $route->profileSnapshot->detour_tolerance->value,
                    'stopIntensity' => $route->profileSnapshot->stop_intensity->value,
                    'experienceWeights' => $route->profileSnapshot->experience_weights,
                ] : null,
            ], 'Rota oluşturuldu.', 201);

        } catch (\Exception $e) {
            return $this->error('Rota oluşturulurken bir hata oluştu.', 500, $e->getMessage());
        }
    }

    /**
     * List saved routes for the authenticated user.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $user = $request->user();

            $routes = $user->routes()
                ->saved()
                ->notArchived()
                ->with(['stops' => fn($q) => $q->orderBy('order_index')])
                ->orderBy('updated_at', 'desc')
                ->paginate(20);

            $formattedRoutes = $routes->getCollection()->map(function ($route) {
                return [
                    'uuid' => $route->uuid,
                    'name' => $route->name,
                    'originAddress' => $route->origin_address,
                    'destinationAddress' => $route->destination_address,
                    'routeMode' => $route->route_mode->value,
                    'status' => $route->status->value,
                    'totalDistanceMeters' => $route->total_distance_meters,
                    'totalDurationMinutes' => $route->total_duration_minutes,
                    'stopsCount' => $route->stops->count(),
                    'createdAt' => $route->created_at?->toIso8601String(),
                    'updatedAt' => $route->updated_at?->toIso8601String(),
                ];
            });

            return $this->success([
                'routes' => $formattedRoutes,
                'pagination' => [
                    'currentPage' => $routes->currentPage(),
                    'lastPage' => $routes->lastPage(),
                    'perPage' => $routes->perPage(),
                    'total' => $routes->total(),
                ],
            ], 'Rotalar listelendi.');

        } catch (\Exception $e) {
            return $this->error('Rotalar listelenirken bir hata oluştu.', 500, $e->getMessage());
        }
    }

    /**
     * Get a specific route by UUID.
     *
     * @param Request $request
     * @param string $uuid
     * @return JsonResponse
     */
    public function show(Request $request, string $uuid): JsonResponse
    {
        try {
            $user = $request->user();

            $route = Route::where('uuid', $uuid)
                ->where('user_id', $user->id)
                ->with(['stops' => fn($q) => $q->orderBy('order_index'), 'profileSnapshot'])
                ->first();

            if (!$route) {
                return $this->error('Rota bulunamadı.', 404);
            }

            return $this->success([
                'route' => $this->formatRouteForResponse($route->toArray()),
                'stops' => $route->stops->map(fn($s) => $this->formatStopForResponse($s->toArray())),
                'profileSnapshot' => $route->profileSnapshot ? [
                    'travelStyle' => $route->profileSnapshot->travel_style->value,
                    'detourTolerance' => $route->profileSnapshot->detour_tolerance->value,
                    'budgetSensitivity' => $route->profileSnapshot->budget_sensitivity->value,
                    'groupType' => $route->profileSnapshot->group_type->value,
                    'stopIntensity' => $route->profileSnapshot->stop_intensity->value,
                    'experienceWeights' => $route->profileSnapshot->experience_weights,
                ] : null,
            ], 'Rota detayları alındı.');

        } catch (\Exception $e) {
            return $this->error('Rota detayları alınırken bir hata oluştu.', 500, $e->getMessage());
        }
    }

    /**
     * Update a route.
     *
     * @param UpdateRouteRequest $request
     * @param string $uuid
     * @return JsonResponse
     */
    public function update(UpdateRouteRequest $request, string $uuid): JsonResponse
    {
        try {
            $user = $request->user();

            $route = Route::where('uuid', $uuid)
                ->where('user_id', $user->id)
                ->first();

            if (!$route) {
                return $this->error('Rota bulunamadı.', 404);
            }

            // Update only provided fields (map camelCase to snake_case)
            $mappings = [
                'name' => 'name',
                'routeMode' => 'route_mode',
                'departureTime' => 'departure_time',
                'maxDurationMinutes' => 'max_duration_minutes',
                'stopIntensityOverride' => 'stop_intensity_override',
                'detourToleranceOverride' => 'detour_tolerance_override',
                'isSaved' => 'is_saved',
                'status' => 'status',
            ];

            foreach ($mappings as $camelCase => $snakeCase) {
                if ($request->has($camelCase)) {
                    $route->$snakeCase = $request->$camelCase;
                }
            }

            $route->save();
            $route->load(['stops', 'profileSnapshot']);

            return $this->success([
                'route' => $this->formatRouteForResponse($route->toArray()),
                'stops' => $route->stops->map(fn($s) => $this->formatStopForResponse($s->toArray())),
            ], 'Rota güncellendi.');

        } catch (\Exception $e) {
            return $this->error('Rota güncellenirken bir hata oluştu.', 500, $e->getMessage());
        }
    }

    /**
     * Archive (soft delete) a route.
     *
     * @param Request $request
     * @param string $uuid
     * @return JsonResponse
     */
    public function destroy(Request $request, string $uuid): JsonResponse
    {
        try {
            $user = $request->user();

            $route = Route::where('uuid', $uuid)
                ->where('user_id', $user->id)
                ->first();

            if (!$route) {
                return $this->error('Rota bulunamadı.', 404);
            }

            $route->status = RouteStatus::Archived;
            $route->save();

            return $this->success([
                'uuid' => $route->uuid,
                'status' => 'archived',
            ], 'Rota arşivlendi.');

        } catch (\Exception $e) {
            return $this->error('Rota arşivlenirken bir hata oluştu.', 500, $e->getMessage());
        }
    }

    /**
     * Regenerate a route with current profile settings.
     *
     * @param Request $request
     * @param string $uuid
     * @return JsonResponse
     */
    public function regenerate(Request $request, string $uuid): JsonResponse
    {
        try {
            $user = $request->user();

            $route = Route::where('uuid', $uuid)
                ->where('user_id', $user->id)
                ->first();

            if (!$route) {
                return $this->error('Rota bulunamadı.', 404);
            }

            // Delete old profile snapshot and create new one
            $route->profileSnapshot?->delete();
            RouteProfileSnapshot::createFromUser($route->id, $user);

            // Update route metadata
            $route->generated_at = now();
            $route->status = RouteStatus::Generated;
            $route->save();

            // TODO: Re-calculate stops based on new profile
            // For now, just update the snapshot

            $route->load(['stops', 'profileSnapshot']);

            return $this->success([
                'route' => $this->formatRouteForResponse($route->toArray()),
                'stops' => $route->stops->map(fn($s) => $this->formatStopForResponse($s->toArray())),
                'profileSnapshot' => $route->profileSnapshot ? [
                    'travelStyle' => $route->profileSnapshot->travel_style->value,
                    'detourTolerance' => $route->profileSnapshot->detour_tolerance->value,
                    'stopIntensity' => $route->profileSnapshot->stop_intensity->value,
                    'experienceWeights' => $route->profileSnapshot->experience_weights,
                ] : null,
            ], 'Rota yeniden oluşturuldu.');

        } catch (\Exception $e) {
            return $this->error('Rota yeniden oluşturulurken bir hata oluştu.', 500, $e->getMessage());
        }
    }

    /**
     * Build route data from request.
     */
    private function buildRouteData(CreateRouteRequest $request, int $userId): array
    {
        return [
            'user_id' => $userId,
            'name' => $request->name,
            'origin_address' => $request->originAddress,
            'origin_lat' => $request->originLat,
            'origin_lng' => $request->originLng,
            'destination_address' => $request->destinationAddress,
            'destination_lat' => $request->destinationLat,
            'destination_lng' => $request->destinationLng,
            'route_mode' => $request->routeMode,
            'departure_time' => $request->departureTime,
            'max_duration_minutes' => $request->maxDurationMinutes,
            'stop_intensity_override' => $request->stopIntensityOverride,
            'detour_tolerance_override' => $request->detourToleranceOverride,
        ];
    }

    /**
     * Build stops array from request waypoints.
     */
    private function buildStopsFromRequest(CreateRouteRequest $request): array
    {
        $stops = [];
        $waypoints = $request->waypoints ?? [];

        foreach ($waypoints as $index => $waypoint) {
            $stops[] = [
                'orderIndex' => $index,
                'placeId' => $waypoint['placeId'],
                'placeName' => $waypoint['placeName'],
                'placeAddress' => $waypoint['placeAddress'],
                'lat' => $waypoint['lat'],
                'lng' => $waypoint['lng'],
                'stopType' => StopType::Waypoint->value,
            ];
        }

        return $stops;
    }

    /**
     * Create stops for a route from request.
     */
    private function createStopsForRoute(Route $route, CreateRouteRequest $request): void
    {
        $waypoints = $request->waypoints ?? [];

        foreach ($waypoints as $index => $waypoint) {
            RouteStop::create([
                'route_id' => $route->id,
                'order_index' => $index,
                'place_id' => $waypoint['placeId'],
                'place_name' => $waypoint['placeName'],
                'place_address' => $waypoint['placeAddress'],
                'lat' => $waypoint['lat'],
                'lng' => $waypoint['lng'],
                'stop_type' => StopType::Waypoint,
            ]);
        }
    }

    /**
     * Format route data for API response (camelCase).
     */
    private function formatRouteForResponse(array $route): array
    {
        return [
            'uuid' => $route['uuid'] ?? null,
            'name' => $route['name'] ?? null,
            'originAddress' => $route['origin_address'] ?? null,
            'originLat' => (float) ($route['origin_lat'] ?? 0),
            'originLng' => (float) ($route['origin_lng'] ?? 0),
            'destinationAddress' => $route['destination_address'] ?? null,
            'destinationLat' => (float) ($route['destination_lat'] ?? 0),
            'destinationLng' => (float) ($route['destination_lng'] ?? 0),
            'routeMode' => $route['route_mode'] ?? 'casual',
            'departureTime' => $route['departure_time'] ?? null,
            'maxDurationMinutes' => $route['max_duration_minutes'] ?? null,
            'stopIntensityOverride' => $route['stop_intensity_override'] ?? null,
            'detourToleranceOverride' => $route['detour_tolerance_override'] ?? null,
            'isSaved' => (bool) ($route['is_saved'] ?? false),
            'status' => $route['status'] ?? 'draft',
            'totalDistanceMeters' => $route['total_distance_meters'] ?? null,
            'totalDurationMinutes' => $route['total_duration_minutes'] ?? null,
            'generatedAt' => $route['generated_at'] ?? null,
            'createdAt' => $route['created_at'] ?? null,
            'updatedAt' => $route['updated_at'] ?? null,
        ];
    }

    /**
     * Format stop data for API response (camelCase).
     */
    private function formatStopForResponse(array $stop): array
    {
        return [
            'id' => $stop['id'] ?? null,
            'orderIndex' => $stop['order_index'] ?? 0,
            'placeId' => $stop['place_id'] ?? null,
            'placeName' => $stop['place_name'] ?? null,
            'placeAddress' => $stop['place_address'] ?? null,
            'lat' => (float) ($stop['lat'] ?? 0),
            'lng' => (float) ($stop['lng'] ?? 0),
            'stopType' => $stop['stop_type'] ?? 'waypoint',
            'experienceCardId' => $stop['experience_card_id'] ?? null,
            'relevanceScore' => $stop['relevance_score'] ?? null,
            'estimatedDurationMinutes' => $stop['estimated_duration_minutes'] ?? null,
            'isSkipped' => (bool) ($stop['is_skipped'] ?? false),
        ];
    }
}
