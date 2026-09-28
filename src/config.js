/* =============================================================================
   Mulhim — questionnaire configuration and text.
   Everything the questionnaire web page kept in its CONFIG / top-of-script
   blocks lives here, unchanged in meaning. Colours are no longer configured
   here: the merged app uses the app palette in src/styles/app.css (:root),
   which is the same brand teal the questionnaire used.
   ============================================================================= */

export const CONFIG = {

  /* --- Where responses are sent --------------------------------------------
     "local"  = store in the browser, download CSVs from the Admin Panel.
     "url"    = also send each submission to SUBMIT_URL below.
     Start with "local". Switch to "url" once your Apps Script is published. */
  SUBMIT_MODE: "local",

  /* Paste the Google Apps Script web app address here, between the quotes.
     Leave it empty while SUBMIT_MODE is "local". */
  SUBMIT_URL: "",

  /* --- App store links shown on the final screen ---------------------------
     Replace with your real store listings when they are live. */
  APP_STORE_URL:   "https://apps.apple.com/",
  GOOGLE_PLAY_URL: "https://play.google.com/store",

  /* --- Language -------------------------------------------------------------
     "en" or "ar". The language the app starts in. The first screen lets the
     visitor pick one, and they can switch later with the language button. */
  DEFAULT_LANGUAGE: "ar",

  /* --- Age rule -------------------------------------------------------------
     Anyone younger than this gets the Children questionnaire. */
  CHILD_MAX_AGE: 17,

  /* --- Background logo ------------------------------------------------------
     The Mulhim logo sits very large and faint behind the questionnaire
     screens. To swap the artwork, replace src/assets/logo-mark.png (a PNG with
     a transparent background). Its size is --logo-size in src/styles/qs.css. */
  SHOW_BACKGROUND_LOGO: true,

  /* --- Cover pages between sections -----------------------------------------
     SHOW_SECTION_COVERS
       false = questions run straight on from one section to the next
               (the section name still shows in the top bar).
       true  = a short "Section 3 of 10" page appears before each one.

     QUESTIONNAIRE_COVERS
       "first" = show the cover page only for the first questionnaire.
       "all"   = show it for the follow-up questionnaire too.
       "none"  = never show it. */
  SHOW_SECTION_COVERS: false,
  QUESTIONNAIRE_COVERS: "first",

  /* --- The "3 of 90" counter in the top bar -----------------------------
     "dynamic" = counts only the questions this person will actually be asked,
                 so the total shifts a little when a follow-up question unlocks.
     "fixed"   = always shows the full questionnaire total (90/15/24/8/26),
                 so someone who skips follow-ups finishes on 86 of 90. */
  COUNTER_TOTAL: "dynamic",

  /* --- Optional ------------------------------------------------------------
     Set to false to hide the progress bar under the top bar. */
  SHOW_PROGRESS_BAR: true,

  /* --- Demo bar --------------------------------------------------------------
     The small language / restart buttons above the phone frame (they came from
     the onboarding preview page). Set to false for production. */
  SHOW_DEMO_BAR: true
};

export const INTAKE_OPTIONS = {
  gender: [
    {v:"Male",             en:"Male",             ar:"ذكر"},
    {v:"Female",           en:"Female",           ar:"أنثى"}
  ],
  country: [
    {v:"Saudi Arabia",        en:"Saudi Arabia",        ar:"المملكة العربية السعودية"},
    {v:"United Arab Emirates",en:"United Arab Emirates",ar:"الإمارات العربية المتحدة"},
    {v:"Kuwait",              en:"Kuwait",              ar:"الكويت"},
    {v:"Qatar",               en:"Qatar",               ar:"قطر"},
    {v:"Bahrain",             en:"Bahrain",             ar:"البحرين"},
    {v:"Oman",                en:"Oman",                ar:"عُمان"},
    {v:"Egypt",               en:"Egypt",               ar:"مصر"},
    {v:"Jordan",              en:"Jordan",              ar:"الأردن"},
    {v:"Other",               en:"Other",               ar:"أخرى"}
  ],
  ethnicity: [
    {v:"Arab",                en:"Arab",                ar:"عربي"},
    {v:"Asian",               en:"Asian",               ar:"آسيوي"},
    {v:"African",             en:"African",             ar:"أفريقي"},
    {v:"Caucasian / European",en:"Caucasian / European",ar:"قوقازي / أوروبي"},
    {v:"Hispanic / Latino",   en:"Hispanic / Latino",   ar:"من أصل لاتيني"},
    {v:"Mixed ethnicity",     en:"Mixed ethnicity",     ar:"أصول مختلطة"},
    {v:"Other",               en:"Other",               ar:"أخرى"}
  ],
  athlete: [
    {v:"No", en:"No",  ar:"لا"},
    {v:"Yes",en:"Yes", ar:"نعم"}
  ]
};

/* COUNTRY DIALLING CODES for the little box beside the phone number.
   "iso" is only used to pre-select the code once someone picks a country
   above, so keep it matching the country list where the two overlap.
   To add a country, copy a line. The flag is just an emoji - you can type
   it or paste it. */
export const DIAL_CODES = [
  {iso:"SA", dial:"+966", flag:"🇸🇦", en:"Saudi Arabia",        ar:"السعودية"},
  {iso:"AE", dial:"+971", flag:"🇦🇪", en:"United Arab Emirates",ar:"الإمارات"},
  {iso:"KW", dial:"+965", flag:"🇰🇼", en:"Kuwait",              ar:"الكويت"},
  {iso:"QA", dial:"+974", flag:"🇶🇦", en:"Qatar",               ar:"قطر"},
  {iso:"BH", dial:"+973", flag:"🇧🇭", en:"Bahrain",             ar:"البحرين"},
  {iso:"OM", dial:"+968", flag:"🇴🇲", en:"Oman",                ar:"عُمان"},
  {iso:"EG", dial:"+20",  flag:"🇪🇬", en:"Egypt",               ar:"مصر"},
  {iso:"JO", dial:"+962", flag:"🇯🇴", en:"Jordan",              ar:"الأردن"},
  {iso:"YE", dial:"+967", flag:"🇾🇪", en:"Yemen",               ar:"اليمن"},
  {iso:"IQ", dial:"+964", flag:"🇮🇶", en:"Iraq",                ar:"العراق"},
  {iso:"SY", dial:"+963", flag:"🇸🇾", en:"Syria",               ar:"سوريا"},
  {iso:"LB", dial:"+961", flag:"🇱🇧", en:"Lebanon",             ar:"لبنان"},
  {iso:"PS", dial:"+970", flag:"🇵🇸", en:"Palestine",           ar:"فلسطين"},
  {iso:"SD", dial:"+249", flag:"🇸🇩", en:"Sudan",               ar:"السودان"},
  {iso:"LY", dial:"+218", flag:"🇱🇾", en:"Libya",               ar:"ليبيا"},
  {iso:"TN", dial:"+216", flag:"🇹🇳", en:"Tunisia",             ar:"تونس"},
  {iso:"DZ", dial:"+213", flag:"🇩🇿", en:"Algeria",             ar:"الجزائر"},
  {iso:"MA", dial:"+212", flag:"🇲🇦", en:"Morocco",             ar:"المغرب"},
  {iso:"TR", dial:"+90",  flag:"🇹🇷", en:"Türkiye",             ar:"تركيا"},
  {iso:"PK", dial:"+92",  flag:"🇵🇰", en:"Pakistan",            ar:"باكستان"},
  {iso:"IN", dial:"+91",  flag:"🇮🇳", en:"India",               ar:"الهند"},
  {iso:"BD", dial:"+880", flag:"🇧🇩", en:"Bangladesh",          ar:"بنغلاديش"},
  {iso:"LK", dial:"+94",  flag:"🇱🇰", en:"Sri Lanka",           ar:"سريلانكا"},
  {iso:"PH", dial:"+63",  flag:"🇵🇭", en:"Philippines",         ar:"الفلبين"},
  {iso:"ID", dial:"+62",  flag:"🇮🇩", en:"Indonesia",           ar:"إندونيسيا"},
  {iso:"MY", dial:"+60",  flag:"🇲🇾", en:"Malaysia",            ar:"ماليزيا"},
  {iso:"GB", dial:"+44",  flag:"🇬🇧", en:"United Kingdom",      ar:"المملكة المتحدة"},
  {iso:"US", dial:"+1",   flag:"🇺🇸", en:"United States",       ar:"الولايات المتحدة"},
  {iso:"CA", dial:"+1",   flag:"🇨🇦", en:"Canada",              ar:"كندا"},
  {iso:"FR", dial:"+33",  flag:"🇫🇷", en:"France",              ar:"فرنسا"},
  {iso:"DE", dial:"+49",  flag:"🇩🇪", en:"Germany",             ar:"ألمانيا"},
  {iso:"IT", dial:"+39",  flag:"🇮🇹", en:"Italy",               ar:"إيطاليا"},
  {iso:"ES", dial:"+34",  flag:"🇪🇸", en:"Spain",               ar:"إسبانيا"},
  {iso:"NL", dial:"+31",  flag:"🇳🇱", en:"Netherlands",         ar:"هولندا"},
  {iso:"SE", dial:"+46",  flag:"🇸🇪", en:"Sweden",              ar:"السويد"},
  {iso:"AU", dial:"+61",  flag:"🇦🇺", en:"Australia",           ar:"أستراليا"},
  {iso:"ZA", dial:"+27",  flag:"🇿🇦", en:"South Africa",        ar:"جنوب أفريقيا"},
  {iso:"NG", dial:"+234", flag:"🇳🇬", en:"Nigeria",             ar:"نيجيريا"},
  {iso:"KE", dial:"+254", flag:"🇰🇪", en:"Kenya",               ar:"كينيا"},
  {iso:"ET", dial:"+251", flag:"🇪🇹", en:"Ethiopia",            ar:"إثيوبيا"},
  {iso:"CN", dial:"+86",  flag:"🇨🇳", en:"China",               ar:"الصين"},
  {iso:"JP", dial:"+81",  flag:"🇯🇵", en:"Japan",               ar:"اليابان"}
];

/* The code chosen before anyone touches the picker. */
export const DEFAULT_DIAL = "+966";

/* WHAT COUNTS AS A SENSIBLE ANSWER.
   Change a number here to loosen or tighten a check.
   "digits" counts only 0-9, so spaces and dashes never break a rule. */
export const LIMITS = {
  name:    {min:2,  max:80},    /* letters, spaces, hyphen, apostrophe, dot */
  email:   {max:120},
  phone:   {minDigits:6, maxDigits:15},   /* 15 is the world maximum (E.164) */
  nid:     {min:4,  max:24},    /* letters, digits and hyphen               */
  other:   {max:120},           /* the box under an "Other" choice          */
  freetext:{max:200}            /* open text questions                      */
};

/* Sensible ranges for the number questions, by question ID.
   Anything not listed here just has to be a positive number. */
export const NUMBER_LIMITS = {
  Q2: {min:20, max:400, unitEn:"kg", unitAr:"كجم"},   /* Weight  */
  Q3: {min:50, max:250, unitEn:"cm", unitAr:"سم"}     /* Height  */
};

/* WHICH QUESTIONNAIRE COMES AFTER JUTHOOR (first matching line wins). */
export function chooseFollowUp(c){
  if (c.age <= CONFIG.CHILD_MAX_AGE)  return "Qs4";   // Children
  if (c.athlete === "Yes")            return "Qs2";   // Athletes
  if (c.gender  === "Male")           return "Qs3";   // Men
  if (c.gender  === "Female")         return "Qs5";   // Women
  return null;                                        // Juthoor only
}

/* Wording of the buttons and labels. Left side = English, right = Arabic. */
export const T = {
  back:      ["Back","السابق"],
  next:      ["Next","التالي"],
  begin:     ["Begin","ابدأ"],
  start:     ["Start the questionnaire","ابدأ الاستبيان"],
  continue_: ["Continue","متابعة"],
  finish:    ["Finish","إنهاء"],
  of:        ["of","من"],
  question:  ["Question","سؤال"],
  section:   ["Section","القسم"],
  required:  ["Please answer this question to continue.","يُرجى الإجابة على هذا السؤال للمتابعة."],
  maxsel:    ["You can choose up to {n}.","يمكنك اختيار {n} كحد أقصى."],
  fillfields:["Please complete the highlighted fields.","يُرجى إكمال الحقول المحددة."],
  specify:   ["Please type your answer","يُرجى كتابة إجابتك"],
  restart:   ["Start over? Your current answers will be lost.","هل تريد البدء من جديد؟ ستفقد إجاباتك الحالية."],
  saved:     ["Saved","تم الحفظ"],
  sent:      ["Sent","تم الإرسال"],
  sendfail:  ["Could not reach the server — saved on this device instead.","تعذّر الوصول إلى الخادم — تم الحفظ على هذا الجهاز."],
  fixfields: ["Please check the highlighted fields.","يُرجى مراجعة الحقول المحددة."],
  badName:   ["Use letters only, at least 2 of them.","استخدم الحروف فقط، بحد أدنى حرفان."],
  badEmail:  ["Enter an address like name@example.com","أدخل بريدًا مثل name@example.com"],
  badPhone:  ["Enter digits only, 6 to 15 of them.","أدخل أرقامًا فقط، من ٦ إلى ١٥ رقمًا."],
  badNid:    ["Use 4 to 24 letters or digits.","استخدم من ٤ إلى ٢٤ حرفًا أو رقمًا."],
  badDate:   ["Choose a date that is not in the future.","اختر تاريخًا غير مستقبلي."],
  badOther:  ["Please type what \"Other\" means for you.","يُرجى كتابة ما تعنيه «أخرى» بالنسبة لك."],
  numRange:  ["Enter a number between {min} and {max}.","أدخل رقمًا بين {min} و{max}."],
  otherLabel:["Please tell us more","يُرجى التوضيح"]
};
