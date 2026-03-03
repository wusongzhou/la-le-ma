import { Text, TextProps } from './Themed';

const monoStyle = { fontFamily: 'SpaceMono' };

export function MonoText(props: TextProps) {
  return <Text {...props} style={[props.style, monoStyle]} />;
}
