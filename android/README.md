# Android: Google Maps API key setup (secure)

This project injects the Android Google Maps API key at build time so the key is not committed in source control.

Two supported ways to provide the key:

1) Recommended: environment variable (CI / local machine)

   - Set environment variable `ANDROID_GOOGLE_MAPS_KEY` on your machine or in CI.
   - Example (PowerShell):

     ```powershell
     $env:ANDROID_GOOGLE_MAPS_KEY = 'YOUR_API_KEY_HERE'
     cd android
     gradlew clean
     cd ..
     npx react-native run-android
     ```

   - On CI (GitHub Actions, CircleCI, etc.) add `ANDROID_GOOGLE_MAPS_KEY` as a secret and make sure the runner exports it before the Gradle build.

2) Alternative (less secure, local testing only): gradle.properties

   - Add to `android/gradle.properties` locally (do NOT commit):

     ```properties
     GOOGLE_MAPS_API_KEY=YOUR_API_KEY_HERE
     ```

   - Build as usual; the key is injected as a string resource `google_maps_key` during the Android build.

What the repo already does

- `android/app/build.gradle` has logic in `defaultConfig` that sets:

  ```groovy
  def mapsKey = project.hasProperty('GOOGLE_MAPS_API_KEY') ? project.property('GOOGLE_MAPS_API_KEY') : System.getenv('ANDROID_GOOGLE_MAPS_KEY')
  if (mapsKey == null) mapsKey = ""
  resValue "string", "google_maps_key", mapsKey
  ```

- `android/app/src/main/AndroidManifest.xml` references `@string/google_maps_key`.

How to restrict the API key (Google Cloud Console)

1. In Google Cloud Console, open `APIs & Services > Credentials` and select your key.
2. Under Application restrictions, choose **Android apps**.
3. Add an entry with:
   - Package name: `com.anonymous.tempapp` (this project's native `applicationId`)
   - SHA-1 certificate fingerprint: the debug key SHA-1 (see next section)
4. Under API restrictions, allow **Maps SDK for Android** and any other APIs you use (Places, Directions, etc.).
5. Save changes.

How to get the debug SHA-1 (run locally)

PowerShell (from the repository root):

```powershell
cd android
gradlew signingReport
```

Look for `Variant: debug` and copy the `SHA1:` value. Use that when adding the Android app restriction in Google Cloud.

Common troubleshooting

- If map is still stuck after providing the key:
  - Ensure billing is enabled for the Google Cloud project.
  - Check `npx react-native log-android` for messages like "Authorization failure" or "API key not authorized".
  - Ensure the package name used in the key restriction matches the native Gradle `applicationId` (see `android/app/build.gradle`).

Security notes

- Do NOT commit keys to the repo. Use env vars or your CI secret store.
- For production, create a separate API key for release builds and restrict it to release SHA-1 and package name.

If you want, paste the output of `gradlew signingReport` here and I'll give you the exact package+SHA-1 entry you should add to Google Cloud.