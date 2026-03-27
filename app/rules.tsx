import React from 'react';
import {
  ScrollView, View, Text, Image, StyleSheet, Platform,
} from 'react-native';
import { UNIT_DEFS, FOOT_UNITS, NAVAL_UNITS, AIR_UNITS, IMMOBILE_UNITS, FOOT_RANKS, NAVAL_RANKS } from '../src/game/constants';
import { getUnitImage } from '../src/game/unitImages';
import { UnitType } from '../src/game/types';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionDivider} />
      {children}
    </View>
  );
}

function Rule({ num, text }: { num: string; text: string }) {
  return (
    <View style={styles.ruleRow}>
      <Text style={styles.ruleNum}>{num}</Text>
      <Text style={styles.ruleText}>{text}</Text>
    </View>
  );
}

function UnitRow({ type }: { type: UnitType }) {
  const def = UNIT_DEFS[type];
  const rank = FOOT_RANKS[type] ?? NAVAL_RANKS[type];
  return (
    <View style={styles.unitRow}>
      <Image source={getUnitImage('blue', type)} style={styles.unitImg} resizeMode="contain" />
      <View style={styles.unitInfo}>
        <Text style={styles.unitName}>{def.hebrewName}</Text>
        <Text style={styles.unitEng}>{type}</Text>
      </View>
      <View style={styles.unitMeta}>
        <Text style={styles.unitCount}>×{def.count}</Text>
        {rank !== undefined && <Text style={styles.unitRank}>דרגה: {rank}</Text>}
      </View>
    </View>
  );
}

export default function RulesScreen() {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.mainTitle}>סופר טקטיקו</Text>
        <Text style={styles.mainSubtitle}>SUPER TACTICO – חוקי המשחק</Text>
      </View>

      {/* Objective */}
      <Section title="🎯 מטרת המשחק">
        <Text style={styles.bodyText}>
          תפוס את הדגל של היריב והחזר אותו לבסיס הבית שלך (האי שלך) כדי לנצח!
        </Text>
        <Text style={styles.bodyText}>
          2 שחקנים • גילאי 9-99 • אסטרטגיה וטקטיקה
        </Text>
      </Section>

      {/* Board */}
      <Section title="🗺️ לוח המשחק">
        <Rule num="•" text="לוח 20×20 עם שלושה סוגי שטח: יבשה, ים ואי" />
        <Rule num="•" text="שחקן צהוב מציב ב-9 השורות התחתונות" />
        <Rule num="•" text="שחקן כחול מציב ב-9 השורות העליונות" />
        <Rule num="•" text="2 שורות אמצע ריקות בתחילת המשחק" />
      </Section>

      {/* Setup */}
      <Section title="🏗️ הצבה ראשונית">
        <Rule num="i." text="כל שחקן מציב את יחידותיו כרצונו ב-9 שורותיו" />
        <Rule num="ii." text="רק השחקן עצמו רואה את זהות הכלים שלו" />
        <Rule num="iii." text="יש להשאיר לפחות 3 תאים פנויים על האי" />
        <Rule num="iv." text="יש להשאיר מסלול תקיפה פתוח לדגל (לא להקיף במוקשים)" />
        <Rule num="v." text="צהוב מציב ראשון, אחר כך כחול, ואז צהוב מתחיל בתור 1" />
      </Section>

      {/* Movement */}
      <Section title="🏃 תנועה">
        <Rule num="i." text="בכל תור שחקן מזיז יחידה אחת ובוחר: תנועה, טעינה, או תקיפה" />
        <Rule num="ii." text="אין תנועה באלכסון – רק ימינה, שמאלה, למעלה, למטה" />
        <Rule num="iii." text="כלים רגילים זזים תא אחד בכל תור" />
        <Rule num="iv." text="מטוסים זזים מרחק בלתי מוגבל – אך הנתיב חייב להיות פנוי לחלוטין" />
        <Rule num="v." text="כלי יבשה: זזים על יבשה ואי בלבד (חייל ים יכול גם בים)" />
        <Rule num="vi." text="ספינות: זזות בים בלבד" />
        <Rule num="vii." text="אסור לנוע הלוך-ושוב בין אותם שני תאים יותר מפעמיים" />
      </Section>

      {/* Combat */}
      <Section title="⚔️ קרב">
        <Rule num="i." text="כלי נייד רשאי לתקוף כלי אויב סמוך (אין חובה לתקוף)" />
        <Rule num="ii." text="אסור לתקוף מהים אל היבשה ולהיפך" />
        <Rule num="iii." text="הכלי בדרגה נמוכה יותר מפסיד ומוסר. המנצח תופס את התא" />
        <Rule num="iv." text="אם הדרגות שוות – שניהם מוסרים" />
        <Rule num="v." text="ספינה שהובסה בים – היא וכל מטענה מוסרים (אלא אם יש רפסודה)" />
        <Rule num="vi." text="מוקש שזכה לא זזה – הכלי התוקף מוסר" />
        <Rule num="vii." text="חייל שמנצח את הדגל – זזה לתאו ונושא אותו" />
        <Rule num="viii." text="חייל הנושא דגל שהובס ביבשה – הדגל נשאר בתא הנפנוי" />
        <Rule num="ix." text="ספינה הנושאת דגל שהובסה בים – הדגל חוזר לבעליו להצבה ביבשה" />
      </Section>

      {/* Battle table */}
      <Section title="📊 טבלת דרגות – חיל רגלים">
        <View style={styles.rankTable}>
          {[...FOOT_UNITS].sort((a, b) => (FOOT_RANKS[b] ?? 0) - (FOOT_RANKS[a] ?? 0)).map(type => {
            const rank = FOOT_RANKS[type];
            const def = UNIT_DEFS[type];
            return (
              <View key={type} style={styles.rankRow}>
                <Image source={getUnitImage('blue', type)} style={styles.rankImg} resizeMode="contain" />
                <Text style={styles.rankName}>{def.hebrewName}</Text>
                <View style={[styles.rankBadge, { backgroundColor: `hsl(${(rank ?? 0) * 12}, 70%, 25%)` }]}>
                  <Text style={styles.rankBadgeText}>{rank}</Text>
                </View>
              </View>
            );
          })}
        </View>
        <Text style={styles.rankNote}>* דרגה גבוהה יותר מנצחת. שוויון = שניהם נהרסים.</Text>
      </Section>

      {/* Special rules */}
      <Section title="⭐ כללים מיוחדים">
        <Rule num="קומנדו" text="מנצח: מוקשים, רב-אלוף, חייל ים, דגל, מטוסים" />
        <Rule num="חייל ים" text="כשהוא התוקף: מנצח ספינת M7, רב-אלוף. תמיד מנצח: מוקש ים, מטוסים, דגל" />
        <Rule num="מוקש יבשה" text="מנצח הכל חוץ מקומנדו" />
        <Rule num="מוקש ים" text="מנצח הכל חוץ מ: חייל ים, קומנדו, ספינת M7" />
        <Rule num="דגל" text="רק חיל רגלים (לא חייל ים) יכול לתפוס אותו. מטוסים וחייל ים מודחים" />
        <Rule num="ספינות vs מטוסים" text="כל הספינות מנצחות מטוסים" />
        <Rule num="מטוס קרב vs מטוס סיור" text="מטוס קרב מנצח" />
      </Section>

      {/* Transport */}
      <Section title="🚢 טעינה ושינוע">
        <Rule num="i." text="ניתן לשנע רק יחידות שלך ודגל האויב" />
        <Rule num="ii." text="טעינה בין תאים סמוכים (כולל יבשה-ים). ללא אלכסון" />
        <Rule num="iii." text="רק יחידה אחת נטענת בכל תור" />
        <Rule num="iv." text="חייל הנושא דגל נחשב יחידה אחת לצורך טעינה" />
        <View style={styles.capTable}>
          {[
            { type: 'M7 Ship' as UnitType, notes: '4 חיילים + 1 מוקש + ספינה קטנה + מטוס סיור' },
            { type: 'M4 Ship' as UnitType, notes: '4 חיילים + 1 מוקש + ספינה קטנה' },
            { type: 'Patrol Ship' as UnitType, notes: '4 חיילים + 1 מוקש' },
            { type: 'Life Raft' as UnitType, notes: '2 חיילים (או 1 חייל + דגל)' },
            { type: 'Fighter Plane' as UnitType, notes: '5 חיילים + 1 מוקש (לא דגל)' },
            { type: 'Reconnaissance Plane' as UnitType, notes: '2 חיילים + 1 מוקש (לא דגל)' },
          ].map(({ type, notes }) => {
            const def = UNIT_DEFS[type];
            return (
              <View key={type} style={styles.capRow}>
                <Image source={getUnitImage('blue', type)} style={styles.capImg} resizeMode="contain" />
                <View style={styles.capInfo}>
                  <Text style={styles.capName}>{def.hebrewName}</Text>
                  <Text style={styles.capNotes}>{notes}</Text>
                </View>
              </View>
            );
          })}
        </View>
        <Text style={styles.rankNote}>
          * רפסודת הצלה חייבת להיות ריקה כדי להיטען על ספינה!
        </Text>
      </Section>

      {/* Life raft escape */}
      <Section title="🚣 בריחה ברפסודת הצלה">
        <Rule num="i." text="אם ספינה שהובסה נשאה רפסודת הצלה – ניתן להציל עד 2 חיילים" />
        <Rule num="ii." text="הרפסודה זזה לתא סמוך לספינה שהובסה" />
        <Rule num="iii." text="ניתן להציל 1 חייל + דגל אויב" />
      </Section>

      {/* Flag capture */}
      <Section title="🏳️ כיבוש הדגל">
        <Rule num="i." text="כל חיל רגלים (חוץ מחייל ים) יכול לתפוס ולשאת את הדגל" />
        <Rule num="ii." text="מטוסים לא יכולים לשנע דגל" />
        <Rule num="iii." text="ספינות יכולות לשנע דגל רק אם חייל שנושא אותו נטען אליהן" />
        <Rule num="iv." text="כשהכלי הנושא את הדגל מגיע לאי שלו – הוא מנצח!" />
      </Section>

      {/* All units */}
      <Section title="🎖️ כל היחידות">
        <Text style={styles.catLabel}>חיל רגלים</Text>
        {FOOT_UNITS.map(t => <UnitRow key={t} type={t} />)}
        <Text style={styles.catLabel}>חיל ים</Text>
        {NAVAL_UNITS.map(t => <UnitRow key={t} type={t} />)}
        <Text style={styles.catLabel}>חיל אוויר</Text>
        {AIR_UNITS.map(t => <UnitRow key={t} type={t} />)}
        <Text style={styles.catLabel}>לא ניידים</Text>
        {IMMOBILE_UNITS.map(t => <UnitRow key={t} type={t} />)}
      </Section>

      <View style={styles.footer}>
        <Text style={styles.footerText}>בהצלחה! 🎖️</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0f1e',
  },
  content: {
    padding: Platform.OS === 'web' ? 32 : 16,
    maxWidth: 800,
    alignSelf: 'center',
    width: '100%',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 24,
    marginBottom: 8,
  },
  mainTitle: {
    color: '#FFD700',
    fontSize: 36,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  mainSubtitle: {
    color: '#7a9cc0',
    fontSize: 14,
    marginTop: 4,
    letterSpacing: 2,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    color: '#FFD700',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: '#FFD70033',
    marginBottom: 12,
  },
  bodyText: {
    color: '#aac4e0',
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 6,
  },
  ruleRow: {
    flexDirection: 'row',
    marginBottom: 7,
    alignItems: 'flex-start',
  },
  ruleNum: {
    color: '#FFD700',
    fontSize: 13,
    fontWeight: 'bold',
    minWidth: 50,
    marginTop: 1,
  },
  ruleText: {
    color: '#ddeeff',
    fontSize: 13,
    lineHeight: 20,
    flex: 1,
  },
  rankTable: {
    marginBottom: 8,
  },
  rankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#1e3a5f',
  },
  rankImg: {
    width: 36,
    height: 36,
    marginRight: 10,
  },
  rankName: {
    color: '#ddeeff',
    fontSize: 13,
    flex: 1,
  },
  rankBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FFD70055',
  },
  rankBadgeText: {
    color: '#FFD700',
    fontWeight: 'bold',
    fontSize: 13,
  },
  rankNote: {
    color: '#7a9cc0',
    fontSize: 11,
    marginTop: 6,
    fontStyle: 'italic',
  },
  capTable: {
    marginTop: 10,
    marginBottom: 4,
  },
  capRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#1e3a5f',
  },
  capImg: {
    width: 40,
    height: 40,
    marginRight: 10,
  },
  capInfo: {
    flex: 1,
  },
  capName: {
    color: '#FFD700',
    fontSize: 13,
    fontWeight: '600',
  },
  capNotes: {
    color: '#aac4e0',
    fontSize: 12,
    marginTop: 2,
  },
  catLabel: {
    color: '#7a9cc0',
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  unitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#1a2a40',
  },
  unitImg: {
    width: 40,
    height: 40,
    marginRight: 10,
  },
  unitInfo: {
    flex: 1,
  },
  unitName: {
    color: '#ddeeff',
    fontSize: 13,
  },
  unitEng: {
    color: '#5a7a9a',
    fontSize: 10,
  },
  unitMeta: {
    alignItems: 'flex-end',
  },
  unitCount: {
    color: '#FFD700',
    fontWeight: 'bold',
    fontSize: 13,
  },
  unitRank: {
    color: '#6eb6ff',
    fontSize: 10,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  footerText: {
    color: '#3a5a7a',
    fontSize: 16,
    letterSpacing: 2,
  },
});
