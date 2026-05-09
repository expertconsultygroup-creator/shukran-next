import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";

// Register Cairo font for Arabic text (local TTF files for reliability)
Font.register({
  family: "Cairo",
  fonts: [
    {
      src: "/fonts/Cairo-Regular.ttf",
      fontWeight: 400,
    },
    {
      src: "/fonts/Cairo-Bold.ttf",
      fontWeight: 700,
    },
  ],
});

const gold = "#CBA344";
const darkBg = "#0a1628";
const white = "#FFFFFF";
const muted = "#8b9ab5";

const styles = StyleSheet.create({
  page: {
    backgroundColor: darkBg,
    padding: 40,
    fontFamily: "Cairo",
    position: "relative",
  },
  border: {
    position: "absolute",
    top: 20,
    left: 20,
    right: 20,
    bottom: 20,
    borderWidth: 3,
    borderColor: gold,
    borderStyle: "solid",
  },
  innerBorder: {
    position: "absolute",
    top: 28,
    left: 28,
    right: 28,
    bottom: 28,
    borderWidth: 1,
    borderColor: `${gold}66`,
    borderStyle: "solid",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 60,
    paddingVertical: 40,
  },
  topDecor: {
    fontSize: 24,
    color: gold,
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: muted,
    marginBottom: 30,
    textAlign: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: 700,
    color: gold,
    marginBottom: 12,
    textAlign: "center",
  },
  bodyText: {
    fontSize: 13,
    color: muted,
    marginBottom: 20,
    textAlign: "center",
  },
  nameContainer: {
    borderBottomWidth: 2,
    borderBottomColor: gold,
    paddingBottom: 8,
    marginBottom: 30,
    paddingHorizontal: 40,
  },
  name: {
    fontSize: 32,
    fontWeight: 700,
    color: white,
    textAlign: "center",
  },
  confirmText: {
    fontSize: 12,
    color: muted,
    textAlign: "center",
    marginBottom: 40,
    lineHeight: 1.6,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 60,
    marginBottom: 30,
  },
  infoBlock: {
    alignItems: "center",
  },
  infoLabel: {
    fontSize: 10,
    color: muted,
    marginBottom: 4,
    textAlign: "center",
  },
  infoValue: {
    fontSize: 14,
    fontWeight: 700,
    color: gold,
    textAlign: "center",
  },
  footer: {
    fontSize: 10,
    color: `${muted}99`,
    textAlign: "center",
    marginTop: 20,
  },
  starLine: {
    fontSize: 16,
    color: gold,
    textAlign: "center",
    marginBottom: 20,
    letterSpacing: 8,
  },
});

interface CertificateProps {
  name: string;
  displayId: string;
  date: string;
  locale: "ar" | "en";
}

const texts = {
  en: {
    topDecor: "✦ ✦ ✦",
    subtitle: "Thank You, Guardians of the Nation",
    title: "Certificate of Participation",
    body: "This certifies that",
    confirmed: "has documented their thank you message to the guardians of the UAE as part of the national campaign for documenting expressions of gratitude.",
    confirmLabel: "Confirmation Number",
    dateLabel: "Date",
    footer: "Shukran Hamaat Al-Watan Platform",
    stars: "★ ✦ ★ ✦ ★",
  },
  ar: {
    topDecor: "✦ ✦ ✦",
    subtitle: "شكراً حماة الوطن",
    title: "شهادة مشاركة",
    body: "تشهد هذه الشهادة بأن",
    confirmed: "قد وثّق رسالة شكر لحماة الوطن ضمن الحملة الوطنية لتوثيق رسائل الامتنان.",
    confirmLabel: "رقم التوثيق",
    dateLabel: "التاريخ",
    footer: "منصة شكراً حماة الوطن",
    stars: "★ ✦ ★ ✦ ★",
  },
};

export function CertificateTemplate({ name, displayId, date, locale }: CertificateProps) {
  const t = texts[locale];
  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.border} />
        <View style={styles.innerBorder} />
        <View style={styles.content}>
          <Text style={styles.topDecor}>{t.topDecor}</Text>
          <Text style={styles.subtitle}>{t.subtitle}</Text>
          <Text style={styles.title}>{t.title}</Text>
          <Text style={styles.starLine}>{t.stars}</Text>
          <Text style={styles.bodyText}>{t.body}</Text>
          <View style={styles.nameContainer}>
            <Text style={{ ...styles.name, direction: dir }}>{name}</Text>
          </View>
          <Text style={{ ...styles.confirmText, direction: dir }}>{t.confirmed}</Text>
          <View style={styles.infoRow}>
            <View style={styles.infoBlock}>
              <Text style={styles.infoLabel}>{t.confirmLabel}</Text>
              <Text style={styles.infoValue}>#{displayId}</Text>
            </View>
            <View style={styles.infoBlock}>
              <Text style={styles.infoLabel}>{t.dateLabel}</Text>
              <Text style={styles.infoValue}>{date}</Text>
            </View>
          </View>
          <Text style={styles.footer}>{t.footer}</Text>
        </View>
      </Page>
    </Document>
  );
}
