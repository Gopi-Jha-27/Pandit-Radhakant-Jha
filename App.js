import React, { useEffect, useState } from "react";
import {
  Alert, Linking, Platform, SafeAreaView, ScrollView, StatusBar,
  StyleSheet, Text, TextInput, TouchableOpacity, View, ActivityIndicator
} from "react-native";
import {
  addDoc, collection, onSnapshot, orderBy, query, serverTimestamp, doc, updateDoc
} from "firebase/firestore";
import {
  onAuthStateChanged, signInWithEmailAndPassword, signOut
} from "firebase/auth";
import { db, auth, firebaseConfigured } from "./firebase";

const PHONE = "7209151803";
const WHATSAPP = "917209151803";
const services = [
  { en: "Satyanarayan Bhagwan Puja", hi: "सत्यनारायण भगवान पूजा" },
  { en: "Griha Pravesh Puja", hi: "गृह प्रवेश पूजा" },
  { en: "Rudrabhishek", hi: "रुद्राभिषेक" },
  { en: "Maha Mrityunjaya Jaap", hi: "महामृत्युंजय जाप" },
  { en: "Durga Path / Chandi Path", hi: "दुर्गा पाठ / चंडी पाठ" },
  { en: "Sundarkand Path", hi: "सुंदरकांड पाठ" },
  { en: "Hanuman Chalisa Path", hi: "हनुमान चालीसा पाठ" },
  { en: "Ganesh Puja", hi: "गणेश पूजा" },
  { en: "Lakshmi Puja", hi: "लक्ष्मी पूजा" },
  { en: "Saraswati Puja", hi: "सरस्वती पूजा" },
  { en: "Navgrah Shanti Puja", hi: "नवग्रह शांति पूजा" },
  { en: "Vastu Shanti Puja", hi: "वास्तु शांति पूजा" },
  { en: "Marriage Ceremony", hi: "विवाह संस्कार" },
  { en: "Mundan Sanskar", hi: "मुंडन संस्कार" },
  { en: "Janeu / Upanayan Sanskar", hi: "जनेऊ / उपनयन संस्कार" },
  { en: "Shradh Karma / Pind Daan", hi: "श्राद्ध कर्म / पिंडदान" },
  { en: "Other Puja / Religious Ceremony", hi: "अन्य पूजा / धार्मिक अनुष्ठान" }
];

const C = {
  dark: "#773416", saffron: "#B95716", gold: "#D6A64B",
  cream: "#FFF8EA", white: "#FFFFFF", ink: "#38251A",
  muted: "#806D60", border: "#EADBC8", green: "#16834A",
  red: "#A83228", pale: "#F7EAD5"
};

const copy = {
  en: {
    home: "Home", services: "Services", booking: "Book Puja", about: "About", contact: "Contact", admin: "Admin",
    hero: "May all be happy and healthy", tagline: "Contact for all kinds of Puja, Path and religious ceremonies",
    name: "Pandit Shri RadhaKant Jha", sub: "Vedic Puja • Path • Havan • Sanskar",
    book: "Book a Puja", whatsapp: "WhatsApp", featured: "Our Services", featuredSub: "Choose a puja or ceremony to enquire",
    all: "View all services", formTitle: "Puja Booking / Enquiry", formSub: "Fill in your details. Your enquiry will be saved and opened in WhatsApp.",
    customer: "Your name *", mobile: "Mobile number *", service: "Select Puja / Path *", date: "Preferred date", time: "Preferred time",
    address: "Full address *", city: "City *", notes: "Additional requirements", send: "Save enquiry & continue to WhatsApp",
    aboutTitle: "About Pandit Ji", aboutText: "Contact Pandit Ji for traditional Hindu puja, Vedic rituals, religious ceremonies and family sanskars. Discuss the puja method, date, timing and required materials directly.",
    contactTitle: "Contact Pandit Ji", call: "Call now", message: "Send WhatsApp message", phone: "Phone",
    adminTitle: "Admin Dashboard", email: "Admin email", password: "Password", login: "Sign in", logout: "Sign out",
    bookings: "Booking enquiries", noBookings: "No booking enquiries yet.", status: "Status", new: "New", accepted: "Accepted", completed: "Completed", rejected: "Rejected",
    required: "Please fill name, valid 10-digit mobile, address and city.", saved: "Enquiry saved. WhatsApp will open with a pre-filled message; press Send to contact Pandit Ji.",
    firebaseMissing: "Firebase is not configured. Add your Firebase settings in the .env file to save enquiries and use the admin dashboard.",
    footer: "Puja • Path • Havan • Sanskar • Religious ceremonies"
  },
  hi: {
    home: "होम", services: "सेवाएँ", booking: "पूजा बुक करें", about: "परिचय", contact: "संपर्क", admin: "एडमिन",
    hero: "सर्वे भवन्तु सुखिनः", tagline: "सभी प्रकार के पूजा-पाठ एवं धार्मिक अनुष्ठानों के लिए संपर्क करें",
    name: "पंडित श्री राधाकांत झा", sub: "वैदिक पूजा • पाठ • हवन • संस्कार",
    book: "पूजा बुक करें", whatsapp: "व्हाट्सऐप", featured: "हमारी सेवाएँ", featuredSub: "पूजा या संस्कार की जानकारी के लिए चुनें",
    all: "सभी सेवाएँ देखें", formTitle: "पूजा बुकिंग / पूछताछ", formSub: "जानकारी भरें। आपकी पूछताछ सेव होगी और WhatsApp खुलेगा।",
    customer: "आपका नाम *", mobile: "मोबाइल नंबर *", service: "पूजा / पाठ चुनें *", date: "पसंदीदा तारीख", time: "पसंदीदा समय",
    address: "पूरा पता *", city: "शहर *", notes: "अन्य जानकारी", send: "पूछताछ सेव करें और WhatsApp खोलें",
    aboutTitle: "पंडित जी के बारे में", aboutText: "पारंपरिक हिन्दू पूजा-पाठ, वैदिक विधि-विधान, धार्मिक अनुष्ठान एवं पारिवारिक संस्कारों के लिए संपर्क करें। पूजा की विधि, तिथि, समय और सामग्री के बारे में सीधे बात करें।",
    contactTitle: "पंडित जी से संपर्क करें", call: "अभी कॉल करें", message: "WhatsApp संदेश भेजें", phone: "मोबाइल",
    adminTitle: "एडमिन डैशबोर्ड", email: "एडमिन ईमेल", password: "पासवर्ड", login: "लॉगिन करें", logout: "लॉगआउट",
    bookings: "बुकिंग पूछताछ", noBookings: "अभी कोई बुकिंग नहीं है।", status: "स्थिति", new: "नई", accepted: "स्वीकृत", completed: "पूरी हुई", rejected: "रद्द",
    required: "कृपया नाम, सही 10 अंकों का मोबाइल, पता और शहर भरें।", saved: "पूछताछ सेव हो गई। WhatsApp में संदेश खुलेगा; पंडित जी को भेजने के लिए Send दबाएँ।",
    firebaseMissing: ".env फाइल में Firebase सेटिंग जोड़ें। इसके बिना पूछताछ सेव और एडमिन डैशबोर्ड काम नहीं करेंगे।",
    footer: "पूजा • पाठ • हवन • संस्कार • धार्मिक अनुष्ठान"
  }
};

function notify(title, message) {
  if (Platform.OS === "web") window.alert(`${title}\n\n${message}`);
  else Alert.alert(title, message);
}
function openUrl(url) {
  Linking.openURL(url).catch(() => notify("Error", "Link open nahi ho paya."));
}
function Button({ title, onPress, secondary = false, disabled = false }) {
  return (
    <TouchableOpacity disabled={disabled} onPress={onPress}
      style={[styles.button, secondary && styles.secondaryButton, disabled && { opacity: 0.55 }]}>
      <Text style={[styles.buttonText, secondary && styles.secondaryButtonText]}>{title}</Text>
    </TouchableOpacity>
  );
}
function Field({ label, value, onChangeText, placeholder, keyboardType, multiline }) {
  return <View style={{ marginTop: 13 }}>
    <Text style={styles.label}>{label}</Text>
    <TextInput value={value} onChangeText={onChangeText} placeholder={placeholder || label}
      keyboardType={keyboardType || "default"} multiline={multiline}
      style={[styles.input, multiline && { minHeight: 82, textAlignVertical: "top" }]} />
  </View>;
}
function Heading({ title, subtitle }) {
  return <View style={{ marginTop: 13, marginBottom: 14 }}>
    <Text style={styles.heading}>{title}</Text>
    {!!subtitle && <Text style={styles.subheading}>{subtitle}</Text>}
  </View>;
}

export default function App() {
  const [lang, setLang] = useState("hi");
  const t = copy[lang];
  const [page, setPage] = useState("Home");
  const [customerName, setCustomerName] = useState("");
  const [mobile, setMobile] = useState("");
  const [selected, setSelected] = useState(services[0].en);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);

  useEffect(() => {
    if (!auth) { setAuthReady(true); return; }
    return onAuthStateChanged(auth, current => { setUser(current); setAuthReady(true); });
  }, []);

  useEffect(() => {
    if (!user || !db) { setBookings([]); return; }
    setLoadingBookings(true);
    const q = query(collection(db, "bookingEnquiries"), orderBy("createdAt", "desc"));
    return onSnapshot(q, snap => {
      setBookings(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoadingBookings(false);
    }, err => {
      setLoadingBookings(false);
      notify("Admin access", "Bookings load nahi ho sake. Firestore admin rules aur admin claim check karein.");
    });
  }, [user]);

  const serviceLabel = s => {
    const found = services.find(x => x.en === s);
    return found ? found[lang] : s;
  };
  const whatsapp = () => openUrl(`https://wa.me/${WHATSAPP}`);
  const call = () => openUrl(`tel:+91${PHONE}`);

  async function submitBooking() {
    if (!customerName.trim() || !/^[6-9]\d{9}$/.test(mobile.trim()) || !address.trim() || !city.trim()) {
      notify("Check details", t.required); return;
    }
    if (!firebaseConfigured || !db) {
      notify("Firebase setup required", t.firebaseMissing); return;
    }
    setSaving(true);
    try {
      const record = {
        name: customerName.trim(), mobile: mobile.trim(), service: selected,
        date: date.trim(), time: time.trim(), address: address.trim(),
        city: city.trim(), notes: notes.trim(), status: "new",
        createdAt: serverTimestamp()
      };
      await addDoc(collection(db, "bookingEnquiries"), record);
      const message = `${lang === "hi" ? "नमस्ते पंडित जी, मुझे पूजा बुक करवानी है।" : "Namaste Pandit Ji, I would like to enquire about a puja."}\n\nName: ${customerName}\nMobile: ${mobile}\nPuja: ${serviceLabel(selected)}\nDate: ${date || "-"}\nTime: ${time || "-"}\nAddress: ${address}\nCity: ${city}\nDetails: ${notes || "-"}`;
      openUrl(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(message)}`);
      notify("Success", t.saved);
      setCustomerName(""); setMobile(""); setDate(""); setTime(""); setAddress(""); setCity(""); setNotes("");
    } catch (e) {
      notify("Booking error", "Enquiry save nahi hui. Firebase configuration aur Firestore rules check karein.");
    } finally { setSaving(false); }
  }

  async function login() {
    if (!auth || !adminEmail.trim() || !adminPassword) {
      notify("Login", "Firebase configure karke admin email aur password enter karein."); return;
    }
    try { await signInWithEmailAndPassword(auth, adminEmail.trim(), adminPassword); setAdminPassword(""); }
    catch (e) { notify("Login failed", "Email/password check karein. Firebase Authentication mein Email/Password enabled hona chahiye."); }
  }
  async function changeStatus(id, status) {
    try { await updateDoc(doc(db, "bookingEnquiries", id), { status, updatedAt: serverTimestamp() }); }
    catch (e) { notify("Update failed", "Admin permission / Firestore rules check karein."); }
  }
  async function logout() { if (auth) await signOut(auth); }

  const nav = ["Home", "Services", "Booking", "About", "Contact", "Admin"];
  const navText = { Home: t.home, Services: t.services, Booking: t.booking, About: t.about, Contact: t.contact, Admin: t.admin };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={C.dark} />
      <View style={styles.header}>
        <View style={styles.omBadge}><Text style={styles.om}>ॐ</Text></View>
        <View style={{ flex: 1 }}>
          <Text style={styles.brand}>{t.name}</Text>
          <Text style={styles.brandSub}>Vedic Puja & Sanskar Services</Text>
        </View>
        <TouchableOpacity onPress={() => setLang(lang === "hi" ? "en" : "hi")} style={styles.langBtn}>
          <Text style={styles.langText}>{lang === "hi" ? "EN" : "हिं"}</Text>
        </TouchableOpacity>
      </View>
      <ScrollView horizontal style={styles.nav} showsHorizontalScrollIndicator={false}>
        {nav.map(n => <TouchableOpacity key={n} onPress={() => setPage(n)}
          style={[styles.navItem, page === n && styles.navActive]}>
          <Text style={[styles.navLabel, page === n && styles.navLabelActive]}>{navText[n]}</Text>
        </TouchableOpacity>)}
      </ScrollView>

      <ScrollView contentContainerStyle={styles.content}>
        {page === "Home" && <>
          <View style={styles.hero}>
            <Text style={styles.heroOm}>ॐ श्री गणेशाय नमः</Text>
            <Text style={styles.heroTitle}>{t.hero}</Text>
            <Text style={styles.heroTag}>{t.tagline}</Text>
            <Text style={styles.heroName}>{t.name}</Text>
            <Text style={styles.heroSub}>{t.sub}</Text>
            <Button title={t.book} onPress={() => setPage("Booking")} />
            <Button title={t.whatsapp} secondary onPress={whatsapp} />
          </View>
          <View style={styles.pledge}><Text style={styles.pledgeText}>🙏 श्रद्धा • विधि-विधान • धार्मिक सेवा 🙏</Text></View>
          <Heading title={t.featured} subtitle={t.featuredSub} />
          <View style={styles.grid}>
            {services.slice(0, 6).map((s, i) => <TouchableOpacity key={s.en} style={styles.serviceCard}
              onPress={() => { setSelected(s.en); setPage("Booking"); }}>
              <Text style={styles.emoji}>{["🪔","🏡","🔱","📿","🌺","🙏"][i]}</Text>
              <Text style={styles.serviceName}>{s[lang]}</Text>
              <Text style={styles.cardLink}>Book / बुक करें →</Text>
            </TouchableOpacity>)}
          </View>
          <Button title={t.all} secondary onPress={() => setPage("Services")} />
        </>}

        {page === "Services" && <>
          <Heading title={t.featured} subtitle={t.featuredSub} />
          {services.map((s, i) => <TouchableOpacity key={s.en} style={styles.listCard}
            onPress={() => { setSelected(s.en); setPage("Booking"); }}>
            <Text style={styles.emoji}>{["🪔","🏡","🔱","📿","🌺","🙏"][i % 6]}</Text>
            <Text style={styles.listTitle}>{s[lang]}</Text><Text style={styles.arrow}>›</Text>
          </TouchableOpacity>)}
          <Text style={styles.helpText}>Other service? Select “Other Puja” and describe your requirement.</Text>
        </>}

        {page === "Booking" && <>
          <Heading title={t.formTitle} subtitle={t.formSub} />
          {!firebaseConfigured && <Text style={styles.warning}>{t.firebaseMissing}</Text>}
          <View style={styles.formCard}>
            <Field label={t.customer} value={customerName} onChangeText={setCustomerName} />
            <Field label={t.mobile} value={mobile} onChangeText={setMobile} keyboardType="phone-pad" />
            <Text style={styles.label}>{t.service}</Text>
            <View style={styles.chips}>
              {services.map(s => <TouchableOpacity key={s.en} onPress={() => setSelected(s.en)}
                style={[styles.chip, selected === s.en && styles.chipActive]}>
                <Text style={[styles.chipText, selected === s.en && styles.chipTextActive]}>{s[lang]}</Text>
              </TouchableOpacity>)}
            </View>
            <Field label={t.date} value={date} onChangeText={setDate} placeholder="DD-MM-YYYY" />
            <Field label={t.time} value={time} onChangeText={setTime} />
            <Field label={t.address} value={address} onChangeText={setAddress} />
            <Field label={t.city} value={city} onChangeText={setCity} />
            <Field label={t.notes} value={notes} onChangeText={setNotes} multiline />
            <Button title={saving ? "Saving..." : t.send} onPress={submitBooking} disabled={saving} />
            <Text style={styles.smallNote}>WhatsApp message khulne ke baad customer ko Send press karna hoga.</Text>
          </View>
        </>}

        {page === "About" && <>
          <Heading title={t.aboutTitle} />
          <View style={styles.aboutCard}>
            <Text style={styles.aboutOm}>ॐ</Text>
            <Text style={styles.aboutName}>{t.name}</Text>
            <Text style={styles.aboutText}>{t.aboutText}</Text>
            <Text style={styles.aboutQuote}>“सर्वे भवन्तु सुखिनः”</Text>
          </View>
        </>}

        {page === "Contact" && <>
          <Heading title={t.contactTitle} />
          <View style={styles.contactCard}>
            <Text style={{ fontSize: 42 }}>🙏</Text>
            <Text style={styles.contactName}>{t.name}</Text>
            <Text style={styles.contactNumber}>+91 {PHONE}</Text>
            <Button title={`☎ ${t.call}`} onPress={call} />
            <Button title={t.message} secondary onPress={whatsapp} />
          </View>
        </>}

        {page === "Admin" && <>
          <Heading title={t.adminTitle} subtitle="Private access for Pandit Ji only" />
          {!firebaseConfigured && <Text style={styles.warning}>{t.firebaseMissing}</Text>}
          {!authReady ? <ActivityIndicator color={C.saffron} /> : !user ? (
            <View style={styles.formCard}>
              <Field label={t.email} value={adminEmail} onChangeText={setAdminEmail} keyboardType="email-address" />
              <Field label={t.password} value={adminPassword} onChangeText={setAdminPassword} />
              <Button title={t.login} onPress={login} />
              <Text style={styles.smallNote}>Admin account Firebase Console mein create karein. Firestore admin claim bhi set hona zaroori hai.</Text>
            </View>
          ) : <>
            <View style={styles.adminBar}>
              <Text style={styles.adminUser}>{user.email}</Text>
              <TouchableOpacity onPress={logout}><Text style={styles.logout}>{t.logout}</Text></TouchableOpacity>
            </View>
            <Heading title={`${t.bookings} (${bookings.length})`} />
            {loadingBookings ? <ActivityIndicator color={C.saffron} /> : bookings.length === 0 ? <Text style={styles.helpText}>{t.noBookings}</Text> :
              bookings.map(b => <View key={b.id} style={styles.bookingCard}>
                <Text style={styles.bookingName}>{b.name || "Customer"} · {b.mobile}</Text>
                <Text style={styles.bookingDetail}>{serviceLabel(b.service)} · {b.date || "Date not set"} · {b.time || "Time not set"}</Text>
                <Text style={styles.bookingDetail}>{b.address}, {b.city}</Text>
                {!!b.notes && <Text style={styles.bookingDetail}>Notes: {b.notes}</Text>}
                <Text style={styles.statusText}>{t.status}: {t[b.status] || b.status || t.new}</Text>
                <View style={styles.statusActions}>
                  {["accepted", "completed", "rejected"].map(s => <TouchableOpacity key={s}
                    onPress={() => changeStatus(b.id, s)} style={styles.statusButton}>
                    <Text style={styles.statusButtonText}>{t[s]}</Text>
                  </TouchableOpacity>)}
                </View>
              </View>)
            }
          </>}
        </>}

        <View style={styles.footer}>
          <Text style={styles.footerOm}>ॐ</Text>
          <Text style={styles.footerName}>{t.name}</Text>
          <Text style={styles.footerText}>{t.footer}</Text>
          <Text style={styles.footerText}>+91 {PHONE}</Text>
          <Text style={styles.copyright}>© {new Date().getFullYear()} RadhaKant Jha</Text>
        </View>
      </ScrollView>
      <TouchableOpacity onPress={whatsapp} style={styles.floatWhatsApp}>
        <Text style={{ color: "white", fontWeight: "bold" }}>WhatsApp</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.cream },
  header: { backgroundColor: C.dark, padding: 13, flexDirection: "row", alignItems: "center", gap: 10 },
  omBadge: { backgroundColor: C.gold, width: 43, height: 43, borderRadius: 23, alignItems: "center", justifyContent: "center" },
  om: { fontSize: 27, color: C.dark, fontWeight: "bold" },
  brand: { color: "#FFF4DC", fontSize: 17, fontWeight: "bold" },
  brandSub: { color: "#F2D5AC", fontSize: 11, marginTop: 3 },
  langBtn: { borderColor: C.gold, borderWidth: 1, borderRadius: 18, paddingVertical: 8, paddingHorizontal: 12 },
  langText: { color: "#FFF2D8", fontWeight: "bold" },
  nav: { flexGrow: 0, backgroundColor: "#FFFDF8", borderBottomWidth: 1, borderBottomColor: C.border },
  navItem: { paddingHorizontal: 13, paddingVertical: 13, borderBottomWidth: 3, borderBottomColor: "transparent" },
  navActive: { borderBottomColor: C.saffron },
  navLabel: { color: C.muted, fontWeight: "600", fontSize: 13 },
  navLabelActive: { color: C.dark },
  content: { padding: 16, paddingBottom: 95, width: "100%", maxWidth: 900, alignSelf: "center" },
  hero: { backgroundColor: C.dark, borderRadius: 21, padding: 23, alignItems: "center", borderWidth: 2, borderColor: C.gold },
  heroOm: { color: C.gold, fontSize: 18, fontWeight: "bold" },
  heroTitle: { color: "#FFF5DC", fontSize: 29, fontWeight: "bold", textAlign: "center", marginTop: 14 },
  heroTag: { color: "#FFE5C0", textAlign: "center", fontSize: 14, lineHeight: 22, marginTop: 13 },
  heroName: { color: "#F8D27C", fontSize: 21, fontWeight: "bold", marginTop: 17, textAlign: "center" },
  heroSub: { color: "#FFE5C0", marginTop: 7, textAlign: "center" },
  button: { backgroundColor: C.gold, padding: 14, borderRadius: 11, alignItems: "center", marginTop: 11, width: "100%" },
  buttonText: { color: C.dark, fontWeight: "bold", fontSize: 14 },
  secondaryButton: { backgroundColor: "transparent", borderWidth: 1, borderColor: C.gold },
  secondaryButtonText: { color: C.gold },
  pledge: { backgroundColor: "#F4E5C8", padding: 13, borderRadius: 11, marginTop: 13, alignItems: "center" },
  pledgeText: { color: C.dark, fontWeight: "bold" },
  heading: { color: C.ink, fontSize: 22, fontWeight: "bold" },
  subheading: { color: C.muted, fontSize: 13, marginTop: 5, lineHeight: 19 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  serviceCard: { width: "48%", flexGrow: 1, backgroundColor: C.white, borderWidth: 1, borderColor: C.border, borderRadius: 14, padding: 14, minHeight: 135 },
  emoji: { fontSize: 25, marginRight: 10 },
  serviceName: { color: C.ink, fontWeight: "bold", marginTop: 8, lineHeight: 20 },
  cardLink: { color: C.saffron, fontSize: 12, fontWeight: "bold", marginTop: 9 },
  listCard: { backgroundColor: C.white, borderWidth: 1, borderColor: C.border, borderRadius: 12, padding: 13, marginBottom: 9, flexDirection: "row", alignItems: "center" },
  listTitle: { color: C.ink, fontWeight: "bold", flex: 1, fontSize: 14 },
  arrow: { color: C.saffron, fontSize: 25 },
  helpText: { color: C.muted, lineHeight: 21, marginTop: 12 },
  formCard: { backgroundColor: C.white, borderWidth: 1, borderColor: C.border, borderRadius: 15, padding: 15 },
  label: { color: C.ink, fontWeight: "bold", fontSize: 13, marginBottom: 6 },
  input: { borderWidth: 1, borderColor: C.border, borderRadius: 9, padding: 12, color: C.ink, backgroundColor: "#FFFEFC", fontSize: 14 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 7 },
  chip: { borderWidth: 1, borderColor: C.border, borderRadius: 18, paddingVertical: 8, paddingHorizontal: 10, backgroundColor: "#FFFEFC" },
  chipActive: { backgroundColor: "#F8E7C8", borderColor: C.saffron },
  chipText: { color: C.muted, fontSize: 12 },
  chipTextActive: { color: C.dark, fontWeight: "bold" },
  smallNote: { color: C.muted, fontSize: 11, marginTop: 12, lineHeight: 17 },
  warning: { color: C.red, backgroundColor: "#FCE9E6", padding: 12, borderRadius: 9, lineHeight: 20, marginBottom: 12 },
  aboutCard: { backgroundColor: C.dark, borderRadius: 18, padding: 22, alignItems: "center", borderWidth: 2, borderColor: C.gold },
  aboutOm: { color: C.gold, fontSize: 52, fontWeight: "bold" },
  aboutName: { color: "#FFF4DC", fontSize: 21, fontWeight: "bold", marginTop: 9, textAlign: "center" },
  aboutText: { color: "#FFE5C0", textAlign: "center", lineHeight: 24, marginTop: 15 },
  aboutQuote: { color: C.gold, fontWeight: "bold", marginTop: 18 },
  contactCard: { backgroundColor: C.white, borderRadius: 17, padding: 22, alignItems: "center", borderWidth: 1, borderColor: C.border },
  contactName: { color: C.ink, fontWeight: "bold", fontSize: 20, marginTop: 10, textAlign: "center" },
  contactNumber: { color: C.saffron, fontWeight: "bold", fontSize: 20, marginVertical: 10 },
  adminBar: { backgroundColor: C.pale, padding: 12, borderRadius: 10, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  adminUser: { color: C.ink, fontWeight: "bold", flex: 1 },
  logout: { color: C.red, fontWeight: "bold" },
  bookingCard: { backgroundColor: C.white, borderWidth: 1, borderColor: C.border, borderRadius: 13, padding: 14, marginBottom: 10 },
  bookingName: { color: C.ink, fontWeight: "bold", fontSize: 15 },
  bookingDetail: { color: C.muted, marginTop: 6, lineHeight: 19, fontSize: 12 },
  statusText: { color: C.saffronDark, fontWeight: "bold", marginTop: 10 },
  statusActions: { flexDirection: "row", flexWrap: "wrap", gap: 7, marginTop: 9 },
  statusButton: { backgroundColor: "#F7EAD5", borderRadius: 8, padding: 8 },
  statusButtonText: { color: C.dark, fontWeight: "bold", fontSize: 11 },
  footer: { backgroundColor: C.dark, borderRadius: 15, padding: 21, alignItems: "center", marginTop: 28 },
  footerOm: { color: C.gold, fontSize: 34, fontWeight: "bold" },
  footerName: { color: "#FFF2D8", fontWeight: "bold", fontSize: 17, marginTop: 5 },
  footerText: { color: "#F6DDB8", fontSize: 12, marginTop: 7, textAlign: "center" },
  copyright: { color: "#E8C6A4", fontSize: 10, marginTop: 15 },
  floatWhatsApp: { position: "absolute", right: 15, bottom: 17, backgroundColor: C.green, borderRadius: 24, paddingVertical: 13, paddingHorizontal: 17, elevation: 5 }
});
