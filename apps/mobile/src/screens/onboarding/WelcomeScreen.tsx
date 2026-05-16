import React, { useState, useEffect } from "react";
import { View, Text, Pressable, StyleSheet, ScrollView, useWindowDimensions, Animated } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { colors, radii } from "../../theme";
import type { AuthStackParamList } from "../../navigation/RootNavigator";

type Props = NativeStackScreenProps<AuthStackParamList, "Welcome">;

const SLIDER_DATA = [
  {
    id: 1,
    title: "Send money with zero hidden fees",
    subtitle: "What you see is exactly what they get. Enjoy transparent pricing on every single transfer to Africa and beyond.",
    color: "#0284c7" // Light blue
  },
  {
    id: 2,
    title: "Bank-level security you can trust",
    subtitle: "We use 256-bit encryption and partner with top-tier financial institutions to keep your money safe at all times.",
    color: "#059669" // Emerald
  },
  {
    id: 3,
    title: "Deliver instantly to mobile wallets",
    subtitle: "Why wait days? Your recipients can access funds in minutes through local mobile money networks.",
    color: "#d97706" // Amber
  }
];

export function WelcomeScreen({ navigation }: Props) {
  const { width } = useWindowDimensions();
  const isDesktop = width > 900;
  
  // Slider State
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % SLIDER_DATA.length);
    }, 5000); // Change slide every 5 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.scrollContent} bounces={false}>
      
      {/* 1. HEADER */}
      <View style={[styles.header, isDesktop && styles.headerDesktop]}>
        <View style={styles.headerLeft}>
          <View style={styles.logoContainer}>
            <View style={styles.logoIcon}><Text style={styles.logoIconText}>DP</Text></View>
            <Text style={styles.logoText}>DukorPay</Text>
          </View>
          {isDesktop && (
            <View style={styles.headerLinks}>
              <Text style={styles.headerLink}>Send Money</Text>
              <Text style={styles.headerLink}>Track Transfer</Text>
              <Text style={styles.headerLink}>Help</Text>
            </View>
          )}
        </View>
        <View style={styles.headerAuth}>
          <Pressable style={styles.headerLogin} onPress={() => navigation.navigate("Login")}>
            <Text style={styles.headerLoginText}>Log In</Text>
          </Pressable>
          <Pressable style={styles.headerSignup} onPress={() => navigation.navigate("Register")}>
            <Text style={styles.headerSignupText}>Join Now</Text>
          </Pressable>
        </View>
      </View>

      {/* 2. HERO SECTION */}
      <View style={styles.heroSectionWrapper}>
        <View style={[styles.hero, isDesktop && styles.heroDesktop]}>
          <View style={[styles.heroLeft, isDesktop && styles.heroLeftDesktop]}>
            <Text style={[styles.heroTitle, isDesktop && styles.heroTitleDesktop]}>
              Send money online safely and securely.
            </Text>
            <Text style={[styles.heroSubtitle, isDesktop && styles.heroSubtitleDesktop]}>
              Join millions who trust us to send money to family and friends overseas. Fast transfers, bank-level security, and great exchange rates.
            </Text>
            {isDesktop && (
              <View style={styles.heroTrustBadges}>
                <View style={styles.trustItem}>
                  <Text style={styles.trustIcon}>⭐️</Text>
                  <Text style={styles.trustText}>4.8/5 on Trustpilot</Text>
                </View>
                <View style={styles.trustItem}>
                  <Text style={styles.trustIcon}>🔒</Text>
                  <Text style={styles.trustText}>256-bit Encryption</Text>
                </View>
              </View>
            )}
          </View>

          {/* Calculator Widget */}
          <View style={[styles.widgetContainer, isDesktop && styles.widgetContainerDesktop]}>
            <View style={styles.widgetHeader}>
              <Text style={styles.widgetTitle}>Exchange Rate Estimate</Text>
            </View>
            <View style={styles.widgetBody}>
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>You send exactly</Text>
                <View style={styles.inputBox}>
                  <Text style={styles.inputPrefix}>$</Text>
                  <Text style={styles.inputValue}>1,000.00</Text>
                  <View style={styles.flagBadge}>
                    <Text style={styles.flagIcon}>🇺🇸</Text>
                    <Text style={styles.currencyCode}>USD</Text>
                  </View>
                </View>
              </View>
              <View style={styles.dropdownBox}>
                <Text style={styles.dropdownLabel}>Delivery Method</Text>
                <Text style={styles.dropdownValue}>🏦 Mobile Money or Bank Deposit</Text>
              </View>
              <View style={styles.feeBreakdown}>
                <View style={styles.feeLine}>
                  <View style={styles.dotLine} />
                  <Text style={styles.feeLabel}>Transfer fee</Text>
                  <Text style={styles.feeValueFree}>$0.00</Text>
                </View>
                <View style={styles.feeLine}>
                  <View style={styles.dotLine} />
                  <Text style={styles.feeLabel}>Exchange rate</Text>
                  <Text style={styles.feeValue}>1.00 USD = 192.00 LRD</Text>
                </View>
              </View>
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Receiver gets</Text>
                <View style={[styles.inputBox, styles.inputBoxHighlight]}>
                  <Text style={styles.inputPrefix}>L$</Text>
                  <Text style={styles.inputValueHighlight}>192,000.00</Text>
                  <View style={styles.flagBadge}>
                    <Text style={styles.flagIcon}>🇱🇷</Text>
                    <Text style={styles.currencyCode}>LRD</Text>
                  </View>
                </View>
              </View>
              <Pressable style={({ pressed }) => [styles.ctaBtn, pressed && styles.ctaBtnPressed]} onPress={() => navigation.navigate("Register")}>
                <Text style={styles.ctaBtnText}>Continue</Text>
              </Pressable>
              <Text style={styles.widgetDisclaimer}>By continuing, you agree to our Terms of Service. Rates are indicative.</Text>
            </View>
          </View>
        </View>
      </View>

      {/* 3. VANGUARD-STYLE SLIDER SECTION */}
      <View style={styles.sliderWrapper}>
        <View style={[styles.sliderContainer, isDesktop && styles.sliderContainerDesktop]}>
          <View style={[styles.sliderCard, { backgroundColor: SLIDER_DATA[activeSlide].color }]}>
            <Text style={styles.sliderTitle}>{SLIDER_DATA[activeSlide].title}</Text>
            <Text style={styles.sliderSubtitle}>{SLIDER_DATA[activeSlide].subtitle}</Text>
          </View>
          <View style={styles.sliderDots}>
            {SLIDER_DATA.map((_, index) => (
              <Pressable key={index} onPress={() => setActiveSlide(index)} style={[styles.dot, activeSlide === index && styles.dotActive]} />
            ))}
          </View>
        </View>
      </View>

      {/* 4. HOW IT WORKS */}
      <View style={styles.howItWorksWrapper}>
        <Text style={styles.sectionHeading}>How to send money</Text>
        <Text style={styles.sectionSubHeading}>It's fast and easy to get started.</Text>
        <View style={[styles.stepsContainer, isDesktop && styles.stepsContainerDesktop]}>
          <View style={styles.stepCard}>
            <View style={styles.stepNumber}><Text style={styles.stepNumberText}>1</Text></View>
            <Text style={styles.stepTitle}>Create a free account</Text>
            <Text style={styles.stepDesc}>Sign up online or in our app. It takes just minutes to verify your identity.</Text>
          </View>
          <View style={styles.stepCard}>
            <View style={styles.stepNumber}><Text style={styles.stepNumberText}>2</Text></View>
            <Text style={styles.stepTitle}>Enter transfer details</Text>
            <Text style={styles.stepDesc}>Tell us who you are sending to, how much, and choose a delivery method.</Text>
          </View>
          <View style={styles.stepCard}>
            <View style={styles.stepNumber}><Text style={styles.stepNumberText}>3</Text></View>
            <Text style={styles.stepTitle}>Confirm and send</Text>
            <Text style={styles.stepDesc}>Pay securely with your bank account or debit card. Track your transfer in real-time.</Text>
          </View>
        </View>
      </View>

      {/* 5. GLOBAL REACH SECTION */}
      <View style={styles.globalReachWrapper}>
        <View style={styles.globalReachContent}>
          <Text style={styles.globalTitle}>Trusted globally.</Text>
          <Text style={styles.globalSubtitle}>We are constantly expanding our network to help you support your loved ones anywhere in the world.</Text>
          <View style={styles.flagGrid}>
            <Text style={styles.hugeFlag}>🇱🇷</Text>
            <Text style={styles.hugeFlag}>🇳🇬</Text>
            <Text style={styles.hugeFlag}>🇬🇭</Text>
            <Text style={styles.hugeFlag}>🇰🇪</Text>
            <Text style={styles.hugeFlag}>🇿🇦</Text>
          </View>
        </View>
      </View>

      {/* 6. APP DOWNLOAD SECTION */}
      <View style={styles.appDownloadWrapper}>
        <View style={[styles.appDownloadContent, isDesktop && styles.appDownloadDesktop]}>
          <View style={styles.appDownloadLeft}>
            <Text style={styles.appTitle}>Manage transfers on the go.</Text>
            <Text style={styles.appSubtitle}>Download the DukorPay app to track your transfers, save recipients, and access exclusive mobile rates.</Text>
            <View style={styles.appButtons}>
              <View style={styles.mockAppBtn}><Text style={styles.mockAppBtnText}>🍏 App Store</Text></View>
              <View style={styles.mockAppBtn}><Text style={styles.mockAppBtnText}>▶️ Google Play</Text></View>
            </View>
          </View>
        </View>
      </View>

      {/* 7. FAT CORPORATE FOOTER */}
      <View style={styles.fatFooter}>
        <View style={[styles.footerGrid, isDesktop && styles.footerGridDesktop]}>
          <View style={styles.footerCol}>
            <Text style={styles.footerLogo}>DukorPay</Text>
            <Text style={styles.footerDesc}>The smarter, faster, and safer way to send money home.</Text>
          </View>
          <View style={styles.footerCol}>
            <Text style={styles.footerTitle}>Company</Text>
            <Text style={styles.footerLink}>About Us</Text>
            <Text style={styles.footerLink}>Careers</Text>
            <Text style={styles.footerLink}>Press</Text>
            <Text style={styles.footerLink}>Investors</Text>
          </View>
          <View style={styles.footerCol}>
            <Text style={styles.footerTitle}>Support</Text>
            <Text style={styles.footerLink}>Help Center</Text>
            <Text style={styles.footerLink}>Contact Us</Text>
            <Text style={styles.footerLink}>Fraud Awareness</Text>
            <Text style={styles.footerLink}>Track a Transfer</Text>
          </View>
          <View style={styles.footerCol}>
            <Text style={styles.footerTitle}>Legal</Text>
            <Text style={styles.footerLink}>Terms of Service</Text>
            <Text style={styles.footerLink}>Privacy Policy</Text>
            <Text style={styles.footerLink}>Cookie Policy</Text>
            <Text style={styles.footerLink}>Licenses & Disclosures</Text>
          </View>
        </View>
        
        <View style={styles.footerBottom}>
          <Text style={styles.footerDisclaimer}>
            DukorPay Technologies is a financial technology company, not a bank. Money transmission services are provided by our licensed partners. All transfers are subject to review and may be delayed or cancelled if they violate regulatory requirements.
          </Text>
          <Text style={styles.footerCopyright}>© {new Date().getFullYear()} DukorPay Technologies. All rights reserved.</Text>
        </View>
      </View>

    </ScrollView>
  );
}

const BRAND_BLUE = "#001a4d"; 
const BRAND_YELLOW = "#ffcc00"; 
const SURFACE_GREY = "#f3f5f7";

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bgElevated },
  scrollContent: { flexGrow: 1, alignItems: "center" },
  
  /* HEADER */
  header: { width: "100%", backgroundColor: colors.bgElevated, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: colors.border, zIndex: 10 },
  headerDesktop: { paddingHorizontal: 40, paddingVertical: 20 },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 32 },
  logoContainer: { flexDirection: "row", alignItems: "center", gap: 10 },
  logoIcon: { backgroundColor: colors.accent, width: 32, height: 32, borderRadius: radii.sm, justifyContent: "center", alignItems: "center" },
  logoIconText: { color: colors.onAccent, fontWeight: "900", fontSize: 14, letterSpacing: 1 },
  logoText: { fontSize: 22, fontWeight: "800", color: BRAND_BLUE, letterSpacing: -0.5 },
  headerLinks: { flexDirection: "row", gap: 24 },
  headerLink: { color: colors.textSecondary, fontWeight: "600", fontSize: 15 },
  headerAuth: { flexDirection: "row", alignItems: "center", gap: 12 },
  headerLogin: { paddingVertical: 8, paddingHorizontal: 12 },
  headerLoginText: { color: BRAND_BLUE, fontWeight: "700", fontSize: 15 },
  headerSignup: { backgroundColor: colors.accent, paddingVertical: 10, paddingHorizontal: 20, borderRadius: radii.pill },
  headerSignupText: { color: colors.onAccent, fontWeight: "700", fontSize: 15 },

  /* HERO */
  heroSectionWrapper: { width: "100%", backgroundColor: BRAND_BLUE, alignItems: "center", paddingBottom: 40 },
  hero: { width: "100%", maxWidth: 1200, paddingHorizontal: 20, paddingTop: 40, flexDirection: "column", gap: 40 },
  heroDesktop: { flexDirection: "row", paddingHorizontal: 40, paddingTop: 80, paddingBottom: 60, alignItems: "flex-start", justifyContent: "space-between", gap: 60 },
  heroLeft: { flex: 1, alignItems: "flex-start" },
  heroLeftDesktop: { paddingRight: 40, marginTop: 20 },
  heroTitle: { fontSize: 42, fontWeight: "800", color: "#ffffff", lineHeight: 48, letterSpacing: -1, marginBottom: 20 },
  heroTitleDesktop: { fontSize: 56, lineHeight: 62 },
  heroSubtitle: { fontSize: 16, color: "#cbd5e1", lineHeight: 26, marginBottom: 32 },
  heroSubtitleDesktop: { fontSize: 18, lineHeight: 28 },
  heroTrustBadges: { flexDirection: "row", gap: 24, marginTop: 10 },
  trustItem: { flexDirection: "row", alignItems: "center", gap: 8 },
  trustIcon: { fontSize: 20 },
  trustText: { color: "#ffffff", fontWeight: "600", fontSize: 15 },

  /* WIDGET */
  widgetContainer: { backgroundColor: "#ffffff", borderRadius: radii.xl, width: "100%", shadowColor: "#000", shadowOffset: { width: 0, height: 24 }, shadowOpacity: 0.3, shadowRadius: 40, elevation: 12 },
  widgetContainerDesktop: { width: 460, flexShrink: 0 },
  widgetHeader: { padding: 24, borderBottomWidth: 1, borderBottomColor: colors.border },
  widgetTitle: { fontSize: 20, fontWeight: "800", color: colors.text, textAlign: "center" },
  widgetBody: { padding: 24 },
  inputWrapper: { marginBottom: 16 },
  inputLabel: { fontSize: 14, fontWeight: "700", color: colors.textSecondary, marginBottom: 8 },
  inputBox: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#cbd5e1", borderRadius: radii.md, paddingHorizontal: 16, paddingVertical: 14, backgroundColor: "#ffffff" },
  inputBoxHighlight: { borderColor: colors.accent, borderWidth: 2, backgroundColor: "#f8fafc" },
  inputPrefix: { fontSize: 24, fontWeight: "600", color: colors.text, marginRight: 8 },
  inputValue: { fontSize: 24, fontWeight: "800", color: colors.text, flex: 1 },
  inputValueHighlight: { fontSize: 24, fontWeight: "800", color: colors.accent, flex: 1 },
  flagBadge: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: SURFACE_GREY, paddingHorizontal: 10, paddingVertical: 6, borderRadius: radii.pill },
  flagIcon: { fontSize: 16 },
  currencyCode: { fontWeight: "800", fontSize: 14, color: colors.text },
  dropdownBox: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#cbd5e1", borderRadius: radii.md, paddingHorizontal: 16, paddingVertical: 16, backgroundColor: "#ffffff", marginBottom: 16 },
  dropdownLabel: { position: "absolute", top: -9, left: 12, backgroundColor: "#ffffff", paddingHorizontal: 4, fontSize: 12, fontWeight: "700", color: colors.textMuted },
  dropdownValue: { fontSize: 16, fontWeight: "600", color: colors.text },
  feeBreakdown: { paddingLeft: 16, marginBottom: 16 },
  feeLine: { flexDirection: "row", alignItems: "center", marginBottom: 12, position: "relative" },
  dotLine: { position: "absolute", left: -16, top: -12, bottom: 12, width: 2, borderLeftWidth: 2, borderLeftColor: "#cbd5e1", borderStyle: "dotted" },
  feeLabel: { fontSize: 14, fontWeight: "600", color: colors.textSecondary, flex: 1 },
  feeValue: { fontSize: 14, fontWeight: "700", color: colors.text },
  feeValueFree: { fontSize: 14, fontWeight: "800", color: colors.success },
  ctaBtn: { backgroundColor: BRAND_YELLOW, paddingVertical: 18, borderRadius: radii.md, alignItems: "center", marginTop: 8 },
  ctaBtnPressed: { opacity: 0.9, transform: [{ scale: 0.98 }] },
  ctaBtnText: { color: "#000000", fontWeight: "900", fontSize: 18 },
  widgetDisclaimer: { color: colors.textMuted, fontSize: 12, textAlign: "center", marginTop: 16, lineHeight: 18 },

  /* SLIDER */
  sliderWrapper: { width: "100%", backgroundColor: SURFACE_GREY, alignItems: "center", paddingVertical: 40 },
  sliderContainer: { width: "100%", maxWidth: 1200, paddingHorizontal: 20 },
  sliderContainerDesktop: { paddingHorizontal: 40 },
  sliderCard: { padding: 40, borderRadius: radii.lg, alignItems: "center", justifyContent: "center", minHeight: 250 },
  sliderTitle: { fontSize: 28, fontWeight: "800", color: "#ffffff", textAlign: "center", marginBottom: 16 },
  sliderSubtitle: { fontSize: 16, color: "rgba(255,255,255,0.9)", textAlign: "center", maxWidth: 600, lineHeight: 24 },
  sliderDots: { flexDirection: "row", justifyContent: "center", marginTop: 24, gap: 12 },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: "#cbd5e1" },
  dotActive: { backgroundColor: BRAND_BLUE, width: 24 },

  /* HOW IT WORKS */
  howItWorksWrapper: { width: "100%", maxWidth: 1200, paddingHorizontal: 20, paddingVertical: 60, alignItems: "center" },
  sectionHeading: { fontSize: 32, fontWeight: "800", color: colors.text, marginBottom: 12, textAlign: "center" },
  sectionSubHeading: { fontSize: 18, color: colors.textSecondary, marginBottom: 48, textAlign: "center" },
  stepsContainer: { flexDirection: "column", gap: 32, width: "100%" },
  stepsContainerDesktop: { flexDirection: "row", gap: 40 },
  stepCard: { flex: 1, alignItems: "center", textAlign: "center" },
  stepNumber: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.accentMuted, justifyContent: "center", alignItems: "center", marginBottom: 20 },
  stepNumberText: { fontSize: 20, fontWeight: "900", color: colors.accent },
  stepTitle: { fontSize: 18, fontWeight: "800", color: colors.text, marginBottom: 12, textAlign: "center" },
  stepDesc: { fontSize: 15, color: colors.textSecondary, lineHeight: 24, textAlign: "center" },

  /* GLOBAL REACH */
  globalReachWrapper: { width: "100%", backgroundColor: "#ffffff", alignItems: "center", paddingVertical: 80, borderTopWidth: 1, borderTopColor: colors.border },
  globalReachContent: { width: "100%", maxWidth: 800, paddingHorizontal: 20, alignItems: "center" },
  globalTitle: { fontSize: 32, fontWeight: "800", color: colors.text, marginBottom: 16, textAlign: "center" },
  globalSubtitle: { fontSize: 18, color: colors.textSecondary, textAlign: "center", lineHeight: 28, marginBottom: 40 },
  flagGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 24 },
  hugeFlag: { fontSize: 48 },

  /* APP DOWNLOAD */
  appDownloadWrapper: { width: "100%", backgroundColor: BRAND_BLUE, alignItems: "center", paddingVertical: 60 },
  appDownloadContent: { width: "100%", maxWidth: 1200, paddingHorizontal: 20, flexDirection: "column", alignItems: "center", textAlign: "center" },
  appDownloadDesktop: { paddingHorizontal: 40 },
  appDownloadLeft: { alignItems: "center", maxWidth: 600 },
  appTitle: { fontSize: 32, fontWeight: "800", color: "#ffffff", marginBottom: 16, textAlign: "center" },
  appSubtitle: { fontSize: 16, color: "#cbd5e1", lineHeight: 24, marginBottom: 32, textAlign: "center" },
  appButtons: { flexDirection: "row", gap: 16, justifyContent: "center" },
  mockAppBtn: { backgroundColor: "#000000", paddingHorizontal: 24, paddingVertical: 14, borderRadius: radii.md, borderWidth: 1, borderColor: "#333" },
  mockAppBtnText: { color: "#ffffff", fontWeight: "700", fontSize: 16 },

  /* FAT FOOTER */
  fatFooter: { width: "100%", backgroundColor: "#0f172a", alignItems: "center", paddingVertical: 60 },
  footerGrid: { width: "100%", maxWidth: 1200, paddingHorizontal: 20, flexDirection: "column", gap: 40, marginBottom: 60 },
  footerGridDesktop: { flexDirection: "row", paddingHorizontal: 40, justifyContent: "space-between", gap: 20 },
  footerCol: { flex: 1, alignItems: "flex-start" },
  footerLogo: { fontSize: 24, fontWeight: "800", color: "#ffffff", marginBottom: 16 },
  footerDesc: { color: "#94a3b8", fontSize: 14, lineHeight: 22, maxWidth: 250 },
  footerTitle: { fontSize: 16, fontWeight: "700", color: "#ffffff", marginBottom: 20 },
  footerLink: { color: "#94a3b8", fontSize: 14, marginBottom: 12, fontWeight: "500" },
  footerBottom: { width: "100%", maxWidth: 1200, paddingHorizontal: 20, borderTopWidth: 1, borderTopColor: "#1e293b", paddingTop: 32, alignItems: "center" },
  footerDisclaimer: { color: "#64748b", fontSize: 12, lineHeight: 18, textAlign: "center", marginBottom: 16, maxWidth: 800 },
  footerCopyright: { color: "#94a3b8", fontSize: 13, textAlign: "center" }
});
