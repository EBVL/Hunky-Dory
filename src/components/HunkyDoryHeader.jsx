import { View, Text, TouchableOpacity } from "react-native";
import Svg, { G, Line, Path, Text as SvgText } from "react-native-svg";

export function HunkyDoryLogo({ width = 80, color = "white" }) {
  const svgW = 400 * (width / 110);
  const svgH = 320 * (width / 110);
  return (
    <Svg width={svgW} height={svgH} viewBox="0 0 400 320">
      <G transform="rotate(-7, 200, 220)">
        <Line x1="200" y1="20" x2="200" y2="220" stroke={color} strokeWidth="7" strokeLinecap="round" />
        <Path d="M200 25 C310 80 350 160 310 215 L200 215 Z" fill="none" stroke={color} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M200 80 C160 110 90 155 85 195 L200 195 Z" fill="none" stroke={color} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M70 220 L330 220 Q305 278 200 283 Q95 278 70 220 Z" fill="none" stroke={color} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M290 118 C290 108 280 100 268 108 C256 100 246 108 246 118 C246 130 268 148 268 148 C268 148 290 130 290 118 Z" fill={color} stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </G>
    </Svg>
  );
}

export function HunkyDoryWordmark({ width = 260, color = "white" }) {
  return (
    <Svg viewBox="0 0 400 60" width={width} height={width * 60 / 400}>
      <SvgText
        x="200" y="48"
        textAnchor="middle"
        fontFamily="Georgia, serif"
        fontSize="46"
        fontWeight="900"
        letterSpacing="2"
        fill={color}
      >
        HUNKY DORY
      </SvgText>
    </Svg>
  );
}

// Full hero banner — used on the welcome/front page
export function HunkyDoryBanner({ bgColor = "#185FA5", style }) {
  return (
    <View style={[{ backgroundColor: bgColor, alignItems: "center", justifyContent: "center", width: "100%", paddingVertical: 20 }, style]}>
      <HunkyDoryLogo width={75} />
      <HunkyDoryWordmark width={260} />
      <Text style={{ color: "rgba(255,255,255,0.82)", fontSize: 14, fontStyle: "italic", marginTop: 6, letterSpacing: 0.3 }}>
        sailing the seas of life together
      </Text>
    </View>
  );
}

// Compact header — used on the dashboard screens
export default function HunkyDoryHeader({
  label,
  title,
  subtitle,
  bgColor = "#185FA5",
  darkMode = false,
  onToggleDarkMode,
  onSignOut,
  children,
}) {
  return (
    <View style={{ backgroundColor: bgColor, paddingHorizontal: 20, paddingTop: 14, paddingBottom: 18 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <HunkyDoryLogo width={32} />
          <HunkyDoryWordmark width={110} />
        </View>
        <View style={{ flexDirection: "row", gap: 8 }}>
          {!!onToggleDarkMode && (
            <TouchableOpacity
              onPress={onToggleDarkMode}
              style={{ backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 20, paddingHorizontal: 12, paddingVertical: 7 }}
            >
              <Text style={{ fontSize: 15 }}>{darkMode ? "☀️" : "🌙"}</Text>
            </TouchableOpacity>
          )}
          {!!onSignOut && (
            <TouchableOpacity
              onPress={onSignOut}
              style={{ backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7 }}
            >
              <Text style={{ color: "rgba(255,255,255,0.85)", fontSize: 13, fontWeight: "600" }}>Sign Out</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {!!label && <Text style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", marginBottom: 2 }}>{label}</Text>}
      {!!title && <Text style={{ fontSize: 22, fontWeight: "800", color: "#fff", lineHeight: 28 }}>{title}</Text>}
      {!!subtitle && <Text style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", marginTop: 2 }}>{subtitle}</Text>}

      {children}
    </View>
  );
}
