import React from "react";
import { View, Text, Pressable, StyleSheet, ScrollView, useWindowDimensions, Image } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { colors, radii } from "../../theme";
import type { AuthStackParamList } from "../../navigation/RootNavigator";

const senderImg = require("../../../assets/images/sender.png");
const familyImg = require("../../../assets/images/family.png");
const connectionImg = require("../../../assets/images/connection.png");
const teamImg = require("../../../assets/images/team.png");
const lizorMark = require("../../../assets/lizor-mark.png");

type Props = NativeStackScreenProps<AuthStackParamList, "Welcome">;

export function WelcomeScreen({ navigation }: Props) {
  const { width } = useWindowDimensions();
  const d = width > 900;

  return (
    <ScrollView style={s.root} contentContainerStyle={s.scroll} bounces={false}>

      {/* HEADER */}
      <View style={[s.header, d && s.headerD]}>
        <View style={s.hLeft}>
          <View style={s.logoBox}><Image source={lizorMark} style={{ width: 34, height: 34 }} accessibilityIgnoresInvertColors /><Text style={s.logoT}>Lizor</Text></View>
          {d && <View style={s.hLinks}><Text style={s.hLink}>Send Money</Text><Text style={s.hLink}>Track Transfer</Text><Text style={s.hLink}>Help</Text></View>}
        </View>
        <View style={s.hAuth}>
          <Pressable style={s.hLogin} onPress={() => navigation.navigate("Login")}><Text style={s.hLoginT}>Log In</Text></Pressable>
          <Pressable style={s.hSignup} onPress={() => navigation.navigate("Register")}><Text style={s.hSignupT}>Join Now</Text></Pressable>
        </View>
      </View>

      {/* HERO — LIGHT BACKGROUND */}
      <View style={s.heroWrap}>
        <View style={[s.hero, d && s.heroD]}>
          <View style={[s.heroL, d && s.heroLD]}>
            <Text style={[s.heroTitle, d && s.heroTitleD]}>Send money online safely and securely.</Text>
            <Text style={[s.heroSub, d && s.heroSubD]}>Join millions who trust us to send money to family and friends overseas. Fast transfers, bank-level security, and great exchange rates.</Text>
            {d && <View style={s.trustRow}><View style={s.trustI}><Text style={s.trustIcon}>⭐️</Text><Text style={s.trustT}>4.8/5 on Trustpilot</Text></View><View style={s.trustI}><Text style={s.trustIcon}>🔒</Text><Text style={s.trustT}>256-bit Encryption</Text></View></View>}
          </View>
          <View style={[s.widget, d && s.widgetD]}>
            <View style={s.wHead}><Text style={s.wTitle}>Exchange Rate Estimate</Text></View>
            <View style={s.wBody}>
              <View style={s.inWrap}><Text style={s.inLabel}>You send exactly</Text><View style={s.inBox}><Text style={s.inPre}>$</Text><Text style={s.inVal}>1,000.00</Text><View style={s.flagB}><Text style={s.flagI}>🇺🇸</Text><Text style={s.cc}>USD</Text></View></View></View>
              <View style={s.ddBox}><Text style={s.ddLabel}>Delivery Method</Text><Text style={s.ddVal}>🏦 Mobile Money or Bank Deposit</Text></View>
              <View style={s.feeWrap}><View style={s.feeL}><Text style={s.feeK}>Transfer fee</Text><Text style={s.feeVFree}>$0.00</Text></View><View style={s.feeL}><Text style={s.feeK}>Exchange rate</Text><Text style={s.feeV}>1.00 USD = 192.00 LRD</Text></View></View>
              <View style={s.inWrap}><Text style={s.inLabel}>Receiver gets</Text><View style={[s.inBox, s.inBoxHL]}><Text style={s.inPre}>L$</Text><Text style={s.inValHL}>192,000.00</Text><View style={s.flagB}><Text style={s.flagI}>🇱🇷</Text><Text style={s.cc}>LRD</Text></View></View></View>
              <Pressable style={({ pressed }) => [s.cta, pressed && s.ctaP]} onPress={() => navigation.navigate("Register")}><Text style={s.ctaT}>Continue</Text></Pressable>
              <Text style={s.wDisclaim}>By continuing, you agree to our Terms of Service.</Text>
            </View>
          </View>
        </View>
      </View>

      {/* IMAGE BANNER — SENDER */}
      <View style={[s.imgSection, { backgroundColor: "#0a58ca" }]}>
        <View style={[s.imgInner, d && s.imgInnerD]}>
          <Image source={senderImg} style={[s.sectionImg, d && s.sectionImgD]} resizeMode="cover" />
          <View style={[s.imgText, d && s.imgTextD]}>
            <Text style={s.imgTitle}>Send from anywhere in the U.S.</Text>
            <Text style={s.imgSub}>Whether you're at home, at work, or on the go — send money to your loved ones in seconds with our simple, intuitive app.</Text>
          </View>
        </View>
      </View>

      {/* HOW IT WORKS */}
      <View style={s.howWrap}>
        <Text style={s.secHead}>How to send money</Text>
        <Text style={s.secSub}>It's fast and easy to get started.</Text>
        <View style={[s.steps, d && s.stepsD]}>
          <View style={s.step}><View style={s.stepN}><Text style={s.stepNT}>1</Text></View><Text style={s.stepTitle}>Create a free account</Text><Text style={s.stepDesc}>Sign up online or in our app. It takes just minutes to verify your identity.</Text></View>
          <View style={s.step}><View style={s.stepN}><Text style={s.stepNT}>2</Text></View><Text style={s.stepTitle}>Enter transfer details</Text><Text style={s.stepDesc}>Tell us who you are sending to, how much, and choose a delivery method.</Text></View>
          <View style={s.step}><View style={s.stepN}><Text style={s.stepNT}>3</Text></View><Text style={s.stepTitle}>Confirm and send</Text><Text style={s.stepDesc}>Pay securely with your bank account or debit card. Track your transfer in real-time.</Text></View>
        </View>
      </View>

      {/* IMAGE BANNER — FAMILY RECEIVING */}
      <View style={[s.imgSection, { backgroundColor: "#059669" }]}>
        <View style={[s.imgInner, d && s.imgInnerD, d && { flexDirection: "row-reverse" }]}>
          <Image source={familyImg} style={[s.sectionImg, d && s.sectionImgD]} resizeMode="cover" />
          <View style={[s.imgText, d && s.imgTextD]}>
            <Text style={s.imgTitle}>Received instantly by family.</Text>
            <Text style={s.imgSub}>Your family can access funds in minutes through local mobile money networks. No waiting, no hassle — just instant financial support when they need it most.</Text>
          </View>
        </View>
      </View>

      {/* GLOBAL REACH */}
      <View style={s.globalWrap}>
        <Text style={s.secHead}>Trusted globally.</Text>
        <Text style={s.secSub}>We are constantly expanding our network to help you support your loved ones anywhere in the world.</Text>
        <View style={s.flagGrid}><Text style={s.bigFlag}>🇱🇷</Text><Text style={s.bigFlag}>🇳🇬</Text><Text style={s.bigFlag}>🇬🇭</Text><Text style={s.bigFlag}>🇰🇪</Text><Text style={s.bigFlag}>🇿🇦</Text></View>
      </View>

      {/* IMAGE BANNER — TEAM / CONNECTION */}
      <View style={[s.imgSection, { backgroundColor: "#7c3aed" }]}>
        <View style={[s.imgInner, d && s.imgInnerD]}>
          <Image source={teamImg} style={[s.sectionImg, d && s.sectionImgD]} resizeMode="cover" />
          <View style={[s.imgText, d && s.imgTextD]}>
            <Text style={s.imgTitle}>Built by people who care.</Text>
            <Text style={s.imgSub}>Our diverse team of financial experts and engineers are dedicated to making international money transfers accessible, affordable, and reliable for everyone.</Text>
          </View>
        </View>
      </View>

      {/* APP DOWNLOAD */}
      <View style={s.appWrap}>
        <View style={s.appInner}>
          <Text style={s.appTitle}>Manage transfers on the go.</Text>
          <Text style={s.appSub}>Download the Lizor app to track your transfers, save recipients, and access exclusive mobile rates.</Text>
          <View style={s.appBtns}><View style={s.appBtn}><Text style={s.appBtnT}>🍏 App Store</Text></View><View style={s.appBtn}><Text style={s.appBtnT}>▶️ Google Play</Text></View></View>
        </View>
      </View>

      {/* FAT FOOTER */}
      <View style={s.footer}>
        <View style={[s.fGrid, d && s.fGridD]}>
          <View style={s.fCol}><Text style={s.fLogo}>Lizor</Text><Text style={s.fDesc}>The smarter, faster, and safer way to send money home.</Text></View>
          <View style={s.fCol}><Text style={s.fTitle}>Company</Text><Text style={s.fLink}>About Us</Text><Text style={s.fLink}>Careers</Text><Text style={s.fLink}>Press</Text><Text style={s.fLink}>Investors</Text></View>
          <View style={s.fCol}><Text style={s.fTitle}>Support</Text><Text style={s.fLink}>Help Center</Text><Text style={s.fLink}>Contact Us</Text><Text style={s.fLink}>Fraud Awareness</Text><Text style={s.fLink}>Track a Transfer</Text></View>
          <View style={s.fCol}><Text style={s.fTitle}>Legal</Text><Text style={s.fLink}>Terms of Service</Text><Text style={s.fLink}>Privacy Policy</Text><Text style={s.fLink}>Cookie Policy</Text><Text style={s.fLink}>Licenses & Disclosures</Text></View>
        </View>
        <View style={s.fBottom}>
          <Text style={s.fDisclaim}>Lizor Technologies is a financial technology company, not a bank. Money transmission services are provided by our licensed partners. All transfers are subject to review.</Text>
          <Text style={s.fCopy}>© {new Date().getFullYear()} Lizor Technologies. All rights reserved.</Text>
        </View>
      </View>

    </ScrollView>
  );
}

const SG = "#f3f5f7";
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#ffffff" },
  scroll: { flexGrow: 1, alignItems: "center" },

  header: { width: "100%", backgroundColor: "#fff", flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: colors.border, zIndex: 10 },
  headerD: { paddingHorizontal: 40, paddingVertical: 20 },
  hLeft: { flexDirection: "row", alignItems: "center", gap: 32 },
  logoBox: { flexDirection: "row", alignItems: "center", gap: 10 },
  logoIcon: { backgroundColor: colors.accent, width: 32, height: 32, borderRadius: radii.sm, justifyContent: "center", alignItems: "center" },
  logoIconT: { color: "#fff", fontWeight: "900", fontSize: 14, letterSpacing: 1 },
  logoT: { fontSize: 22, fontWeight: "800", color: colors.text, letterSpacing: -0.5 },
  hLinks: { flexDirection: "row", gap: 24 },
  hLink: { color: colors.textSecondary, fontWeight: "600", fontSize: 15 },
  hAuth: { flexDirection: "row", alignItems: "center", gap: 12 },
  hLogin: { paddingVertical: 8, paddingHorizontal: 12 },
  hLoginT: { color: colors.text, fontWeight: "700", fontSize: 15 },
  hSignup: { backgroundColor: colors.accent, paddingVertical: 10, paddingHorizontal: 20, borderRadius: radii.pill },
  hSignupT: { color: "#fff", fontWeight: "700", fontSize: 15 },

  heroWrap: { width: "100%", backgroundColor: SG, alignItems: "center", paddingBottom: 60 },
  hero: { width: "100%", maxWidth: 1200, paddingHorizontal: 20, paddingTop: 40, flexDirection: "column", gap: 40 },
  heroD: { flexDirection: "row", paddingHorizontal: 40, paddingTop: 80, paddingBottom: 20, alignItems: "flex-start", justifyContent: "space-between", gap: 60 },
  heroL: { flex: 1, alignItems: "flex-start" },
  heroLD: { paddingRight: 40, marginTop: 20 },
  heroTitle: { fontSize: 42, fontWeight: "800", color: colors.text, lineHeight: 48, letterSpacing: -1, marginBottom: 20 },
  heroTitleD: { fontSize: 56, lineHeight: 62 },
  heroSub: { fontSize: 16, color: colors.textSecondary, lineHeight: 26, marginBottom: 32 },
  heroSubD: { fontSize: 18, lineHeight: 28 },
  trustRow: { flexDirection: "row", gap: 24, marginTop: 10 },
  trustI: { flexDirection: "row", alignItems: "center", gap: 8 },
  trustIcon: { fontSize: 20 },
  trustT: { color: colors.textSecondary, fontWeight: "600", fontSize: 15 },

  widget: { backgroundColor: "#fff", borderRadius: radii.xl, width: "100%", shadowColor: "#000", shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.12, shadowRadius: 40, elevation: 8 },
  widgetD: { width: 460, flexShrink: 0 },
  wHead: { padding: 24, borderBottomWidth: 1, borderBottomColor: colors.border },
  wTitle: { fontSize: 20, fontWeight: "800", color: colors.text, textAlign: "center" },
  wBody: { padding: 24 },
  inWrap: { marginBottom: 16 },
  inLabel: { fontSize: 14, fontWeight: "700", color: colors.textSecondary, marginBottom: 8 },
  inBox: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#cbd5e1", borderRadius: radii.md, paddingHorizontal: 16, paddingVertical: 14 },
  inBoxHL: { borderColor: colors.accent, borderWidth: 2, backgroundColor: "#f8fafc" },
  inPre: { fontSize: 24, fontWeight: "600", color: colors.text, marginRight: 8 },
  inVal: { fontSize: 24, fontWeight: "800", color: colors.text, flex: 1 },
  inValHL: { fontSize: 24, fontWeight: "800", color: colors.accent, flex: 1 },
  flagB: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: SG, paddingHorizontal: 10, paddingVertical: 6, borderRadius: radii.pill },
  flagI: { fontSize: 16 },
  cc: { fontWeight: "800", fontSize: 14, color: colors.text },
  ddBox: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#cbd5e1", borderRadius: radii.md, paddingHorizontal: 16, paddingVertical: 16, marginBottom: 16 },
  ddLabel: { position: "absolute", top: -9, left: 12, backgroundColor: "#fff", paddingHorizontal: 4, fontSize: 12, fontWeight: "700", color: colors.textMuted },
  ddVal: { fontSize: 16, fontWeight: "600", color: colors.text },
  feeWrap: { paddingHorizontal: 8, marginBottom: 16, gap: 10 },
  feeL: { flexDirection: "row", justifyContent: "space-between" },
  feeK: { fontSize: 14, fontWeight: "600", color: colors.textSecondary },
  feeV: { fontSize: 14, fontWeight: "700", color: colors.text },
  feeVFree: { fontSize: 14, fontWeight: "800", color: colors.success },
  cta: { backgroundColor: "#ffcc00", paddingVertical: 18, borderRadius: radii.md, alignItems: "center", marginTop: 8 },
  ctaP: { opacity: 0.9, transform: [{ scale: 0.98 }] },
  ctaT: { color: "#000", fontWeight: "900", fontSize: 18 },
  wDisclaim: { color: colors.textMuted, fontSize: 12, textAlign: "center", marginTop: 16, lineHeight: 18 },

  imgSection: { width: "100%", alignItems: "center", paddingVertical: 0 },
  imgInner: { width: "100%", maxWidth: 1200, flexDirection: "column", alignItems: "center" },
  imgInnerD: { flexDirection: "row", alignItems: "center" },
  sectionImg: { width: "100%", height: 300 },
  sectionImgD: { width: "50%", height: 420 },
  imgText: { padding: 32, flex: 1, alignItems: "flex-start" },
  imgTextD: { padding: 60 },
  imgTitle: { fontSize: 28, fontWeight: "800", color: "#fff", marginBottom: 16 },
  imgSub: { fontSize: 16, color: "rgba(255,255,255,0.9)", lineHeight: 26 },

  howWrap: { width: "100%", maxWidth: 1200, paddingHorizontal: 20, paddingVertical: 60, alignItems: "center" },
  secHead: { fontSize: 32, fontWeight: "800", color: colors.text, marginBottom: 12, textAlign: "center" },
  secSub: { fontSize: 18, color: colors.textSecondary, marginBottom: 48, textAlign: "center" },
  steps: { flexDirection: "column", gap: 32, width: "100%" },
  stepsD: { flexDirection: "row", gap: 40 },
  step: { flex: 1, alignItems: "center" },
  stepN: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.accentMuted, justifyContent: "center", alignItems: "center", marginBottom: 20 },
  stepNT: { fontSize: 20, fontWeight: "900", color: colors.accent },
  stepTitle: { fontSize: 18, fontWeight: "800", color: colors.text, marginBottom: 12, textAlign: "center" },
  stepDesc: { fontSize: 15, color: colors.textSecondary, lineHeight: 24, textAlign: "center" },

  globalWrap: { width: "100%", backgroundColor: "#fff", alignItems: "center", paddingVertical: 80, borderTopWidth: 1, borderTopColor: colors.border },
  flagGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 24 },
  bigFlag: { fontSize: 48 },

  appWrap: { width: "100%", backgroundColor: "#0f172a", alignItems: "center", paddingVertical: 60 },
  appInner: { maxWidth: 600, paddingHorizontal: 20, alignItems: "center" },
  appTitle: { fontSize: 32, fontWeight: "800", color: "#fff", marginBottom: 16, textAlign: "center" },
  appSub: { fontSize: 16, color: "#cbd5e1", lineHeight: 24, marginBottom: 32, textAlign: "center" },
  appBtns: { flexDirection: "row", gap: 16 },
  appBtn: { backgroundColor: "#000", paddingHorizontal: 24, paddingVertical: 14, borderRadius: radii.md, borderWidth: 1, borderColor: "#333" },
  appBtnT: { color: "#fff", fontWeight: "700", fontSize: 16 },

  footer: { width: "100%", backgroundColor: "#0f172a", alignItems: "center", paddingVertical: 60, borderTopWidth: 1, borderTopColor: "#1e293b" },
  fGrid: { width: "100%", maxWidth: 1200, paddingHorizontal: 20, flexDirection: "column", gap: 40, marginBottom: 60 },
  fGridD: { flexDirection: "row", paddingHorizontal: 40, justifyContent: "space-between", gap: 20 },
  fCol: { flex: 1, alignItems: "flex-start" },
  fLogo: { fontSize: 24, fontWeight: "800", color: "#fff", marginBottom: 16 },
  fDesc: { color: "#94a3b8", fontSize: 14, lineHeight: 22, maxWidth: 250 },
  fTitle: { fontSize: 16, fontWeight: "700", color: "#fff", marginBottom: 20 },
  fLink: { color: "#94a3b8", fontSize: 14, marginBottom: 12, fontWeight: "500" },
  fBottom: { width: "100%", maxWidth: 1200, paddingHorizontal: 20, borderTopWidth: 1, borderTopColor: "#1e293b", paddingTop: 32, alignItems: "center" },
  fDisclaim: { color: "#64748b", fontSize: 12, lineHeight: 18, textAlign: "center", marginBottom: 16, maxWidth: 800 },
  fCopy: { color: "#94a3b8", fontSize: 13, textAlign: "center" },
});
