import { View, Text, TouchableOpacity, Modal } from "react-native";
import { useState, useRef } from "react";
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
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0 });
  const burgerRef = useRef(null);

  const openMenu = () => {
    burgerRef.current?.measure((_x, _y, _w, h, _pageX, pageY) => {
      setMenuPos({ top: pageY + h + 6 });
      setMenuOpen(true);
    });
  };

  return (
    <View style={{ backgroundColor: bgColor, paddingHorizontal: 20, paddingTop: 14, paddingBottom: 18 }}>
      <View style={{ flexDirection: "row", justifyContent: "flex-start", alignItems: "center", marginBottom: 10, minHeight: 38 }}>
        {/* Logo + wordmark centered */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <HunkyDoryLogo width={19} />
          <HunkyDoryWordmark width={106} />
        </View>

        {/* Hamburger button pinned to the right */}
        {(!!onToggleDarkMode || !!onSignOut) && (
          <TouchableOpacity
            ref={burgerRef}
            onPress={openMenu}
            style={{ position: "absolute", right: 0, backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8 }}
          >
            <Text style={{ color: "#fff", fontSize: 18, lineHeight: 20 }}>☰</Text>
          </TouchableOpacity>
        )}
      </View>

      {!!label && <Text style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", marginBottom: 2 }}>{label}</Text>}
      {!!title && <Text style={{ fontSize: 22, fontWeight: "800", color: "#fff", lineHeight: 28 }}>{title}</Text>}
      {!!subtitle && <Text style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", marginTop: 2 }}>{subtitle}</Text>}

      {children}

      {/* Settings dropdown */}
      <Modal visible={menuOpen} transparent animationType="fade">
        <View style={{ flex: 1 }} onTouchStart={() => setMenuOpen(false)}>
          <View
            style={{
              position: "absolute", top: menuPos.top, right: 16,
              backgroundColor: "#fff", borderRadius: 18,
              shadowColor: "#000", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.18, shadowRadius: 16, elevation: 12,
              minWidth: 200, overflow: "hidden",
            }}
            onTouchStart={(e) => e.stopPropagation()}
          >
            {!!onToggleDarkMode && (
              <TouchableOpacity
                onPress={() => onToggleDarkMode()}
                style={{ flexDirection: "row", alignItems: "center", gap: 14, paddingHorizontal: 20, paddingVertical: 16 }}
              >
                <Text style={{ fontSize: 20 }}>{darkMode ? "☀️" : "🌙"}</Text>
                <Text style={{ fontSize: 15, fontWeight: "600", color: "#1a1a2e" }}>
                  {darkMode ? "Light Mode" : "Dark Mode"}
                </Text>
              </TouchableOpacity>
            )}
            {!!onToggleDarkMode && !!onSignOut && (
              <View style={{ height: 1, backgroundColor: "#f1f5f9", marginHorizontal: 14 }} />
            )}
            {!!onSignOut && (
              <TouchableOpacity
                onPress={() => { setMenuOpen(false); onSignOut(); }}
                style={{ flexDirection: "row", alignItems: "center", gap: 14, paddingHorizontal: 20, paddingVertical: 16 }}
              >
                <Text style={{ fontSize: 20 }}>🚪</Text>
                <Text style={{ fontSize: 15, fontWeight: "600", color: "#dc2626" }}>Sign Out</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}
