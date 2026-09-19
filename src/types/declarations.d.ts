declare module 'expo-font' {
  export function useFonts(map: { [fontFamily: string]: any }): [boolean, Error | null];
  export function loadAsync(map: { [fontFamily: string]: any }): Promise<void>;
}

declare module '@expo/vector-icons' {
  export const Feather: any;
  export const MaterialCommunityIcons: any;
  export const Ionicons: any;
  export const FontAwesome: any;
  export const FontAwesome5: any;
  export const MaterialIcons: any;
  export const AntDesign: any;
  export const Entypo: any;
  export const Octicons: any;
  export const SimpleLineIcons: any;
  const icons: { [key: string]: any };
  export default icons;
}

declare module '*.png';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.ttf';
