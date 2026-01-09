import { Text as DefaultText, View as DefaultView } from 'react-native';

export function Text(props: DefaultText['props']) {
  return <DefaultText {...props} />;
}

export function View(props: DefaultView['props']) {
  return <DefaultView {...props} />;
}

// Backwards-compatible named export used across the app
export const ThemedText = (props: any) => {
  // Support an optional `type` prop without enforcing strict typings here
  const { type, style, ...rest } = props || {};
  let typeStyle = {} as any;
  if (type === 'title') typeStyle = { fontSize: 20, fontWeight: '700' };
  else if (type === 'subtitle') typeStyle = { fontSize: 16, fontWeight: '600' };
  return <DefaultText {...rest} style={[typeStyle, style]} />;
};