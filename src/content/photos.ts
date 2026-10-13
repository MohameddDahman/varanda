import type { StaticImageData } from "next/image";
import type { L } from "@/i18n/config";

import heroRiverSliding from "@/assets/photos/hero-river-sliding.jpg";
import apartmentLiving from "@/assets/photos/apartment-living.jpg";
import apartmentBedroom from "@/assets/photos/apartment-bedroom.jpg";
import apartmentKitchen from "@/assets/photos/apartment-kitchen.jpg";
import apartmentWindow from "@/assets/photos/apartment-window.jpg";
import officeNight1 from "@/assets/photos/office-night-1.jpg";
import officeNight2 from "@/assets/photos/office-night-2.jpg";
import officeNight3 from "@/assets/photos/office-night-3.jpg";
import villaShutter from "@/assets/photos/villa-shutter.jpg";
import villaShuttersFacade from "@/assets/photos/villa-shutters-facade.jpg";
import entranceDoor from "@/assets/photos/entrance-door.jpg";
import doorLock from "@/assets/photos/door-lock.jpg";
import archedShutter from "@/assets/photos/arched-shutter.jpg";
import buildingProgress from "@/assets/photos/building-progress.jpg";
import fence1 from "@/assets/photos/fence-1.jpg";
import fence2 from "@/assets/photos/fence-2.jpg";
import fence3 from "@/assets/photos/fence-3.jpg";
import fence4 from "@/assets/photos/fence-4.jpg";
import fence5 from "@/assets/photos/fence-5.jpg";
import fence6 from "@/assets/photos/fence-6.jpg";
import woodgrain from "@/assets/photos/woodgrain.jpg";
import tiltTurn from "@/assets/photos/tilt-turn.jpg";
import classicWindow from "@/assets/photos/classic-window.jpg";
import classicTilt from "@/assets/photos/classic-tilt.jpg";
import classicFrenchDoor from "@/assets/photos/classic-french-door.jpg";
import slidingDoor2020 from "@/assets/photos/sliding-door-2020.jpg";
import homeWindow1 from "@/assets/photos/home-window-1.jpg";
import homeWindow2 from "@/assets/photos/home-window-2.jpg";
import homeWindow3 from "@/assets/photos/home-window-3.jpg";
// Product images from the company profile.
import accHandles from "@/assets/profile/acc-handles.jpg";
import accHinges from "@/assets/profile/acc-hinges.jpg";
import accSlidingRollers from "@/assets/profile/acc-sliding-rollers.jpg";
import accConcealedRollers from "@/assets/profile/acc-concealed-rollers.jpg";
import accEspagnolette from "@/assets/profile/acc-espagnolette.jpg";
import accStrikers from "@/assets/profile/acc-strikers.jpg";
import accExtras from "@/assets/profile/acc-extras.jpg";
import glassClear from "@/assets/profile/glass-clear.jpg";
import glassReflective from "@/assets/profile/glass-reflective.jpg";
import glassFume from "@/assets/profile/glass-fume.jpg";
import glassDouble from "@/assets/profile/glass-double.jpg";
import slatPerforated from "@/assets/profile/slat-perforated.jpg";
import slatNgs from "@/assets/profile/slat-ngs.jpg";
import slatBk from "@/assets/profile/slat-bk.jpg";
import installTeam from "@/assets/profile/install-team.jpg";

export type Photo = { src: StaticImageData; alt: L };

const p = (src: StaticImageData, en: string, ar: string): Photo => ({ src, alt: { en, ar } });

export const photos = {
  heroRiverSliding: p(
    heroRiverSliding,
    "White uPVC sliding doors opening onto a balcony above the Nile",
    "أبواب سحاب uPVC بيضاء تطل على شرفة فوق النيل",
  ),
  apartmentLiving: p(
    apartmentLiving,
    "Living room with a four-panel uPVC sliding window",
    "غرفة معيشة بشباك سحاب uPVC من أربع ضلف",
  ),
  apartmentBedroom: p(
    apartmentBedroom,
    "Bedroom with a uPVC window framed by sheer curtains",
    "غرفة نوم بشباك uPVC وستائر خفيفة",
  ),
  apartmentKitchen: p(
    apartmentKitchen,
    "Kitchen during fit-out with a row of high uPVC windows installed",
    "مطبخ أثناء التشطيب مع صف من شبابيك uPVC العلوية بعد التركيب",
  ),
  apartmentWindow: p(
    apartmentWindow,
    "Newly installed uPVC window with its protective film still on",
    "شباك uPVC بعد التركيب مباشرة بغلافه الواقي",
  ),
  officeNight1: p(
    officeNight1,
    "Office building at night with rows of dark-framed uPVC windows lit from inside",
    "مبنى إداري ليلًا بصفوف من شبابيك uPVC بإطارات داكنة مضاءة من الداخل",
  ),
  officeNight2: p(
    officeNight2,
    "Façade of an administrative building with matching dark uPVC windows",
    "واجهة مبنى إداري بشبابيك uPVC داكنة متناسقة",
  ),
  officeNight3: p(
    officeNight3,
    "Full elevation of the office building and its uPVC windows at night",
    "الواجهة الكاملة للمبنى الإداري وشبابيكه ليلًا",
  ),
  villaShutter: p(
    villaShutter,
    "Closed roller shutter with a matching box on a villa window",
    "شاتر مغلق بصندوق متناسق على شباك فيلا",
  ),
  villaShuttersFacade: p(
    villaShuttersFacade,
    "Two roller shutters on a villa façade",
    "شاتران على واجهة فيلا سكنية",
  ),
  entranceDoor: p(
    entranceDoor,
    "uPVC entrance door installed and still wrapped in protective film",
    "باب uPVC للمدخل بعد التركيب بغلافه الواقي",
  ),
  doorLock: p(
    doorLock,
    "Keys and cylinder lock on a white uPVC door",
    "مفاتيح وكالون في باب uPVC أبيض",
  ),
  archedShutter: p(
    archedShutter,
    "Roller shutter made to fit an arched window opening",
    "شاتر مصمم ليناسب فتحة شباك مقوسة",
  ),
  buildingProgress: p(
    buildingProgress,
    "Residential building during construction with dark uPVC windows fitted",
    "عمارة سكنية تحت الإنشاء بعد تركيب شبابيك uPVC داكنة",
  ),
  fence1: p(fence1, "Wood-effect slatted fence on a stone garden wall", "سور بشرائح بمظهر الخشب على سور حجري"),
  fence2: p(fence2, "Slatted garden fence with bougainvillea growing through", "سور حديقة بشرائح تتسلقه نباتات الجهنمية"),
  fence3: p(fence3, "Fenced service yard with a matching slatted gate", "فناء خدمات مسوّر ببوابة متناسقة"),
  fence4: p(fence4, "Long run of slatted fence panels along a garden", "ألواح سور ممتدة على طول حديقة"),
  fence5: p(fence5, "Double sliding gate in wood-effect slats", "بوابة مزدوجة بشرائح بمظهر الخشب"),
  fence6: p(fence6, "Corner of a villa garden enclosed by a slatted fence", "ركن حديقة فيلا محاط بسور من الشرائح"),
  woodgrain: p(woodgrain, "Close-up of a golden oak wood-grain uPVC finish", "لقطة قريبة لتشطيب uPVC بلون الخشب"),
  tiltTurn: p(tiltTurn, "Tilt-and-turn window open in its tilt position", "شباك قلاب ومفصلي مفتوح في وضع التهوية"),
  classicWindow: p(
    classicWindow,
    "Window with classic glazing bars, just installed",
    "شباك بتقسيمات زجاج كلاسيكية بعد التركيب",
  ),
  classicTilt: p(classicTilt, "Tilt window open for ventilation in a tiled room", "شباك قلاب مفتوح للتهوية"),
  classicFrenchDoor: p(
    classicFrenchDoor,
    "Balcony door with classic glazing bars and a side light",
    "باب شرفة بتقسيمات زجاج كلاسيكية وجانب ثابت",
  ),
  slidingDoor2020: p(
    slidingDoor2020,
    "Wide four-panel sliding door between two living spaces",
    "باب سحاب عريض من أربع ضلف بين مساحتين",
  ),
  homeWindow1: p(homeWindow1, "Open hinged uPVC window in a finished room", "شباك uPVC مفصلي مفتوح في غرفة مشطبة"),
  homeWindow2: p(homeWindow2, "Finished room with a two-panel uPVC window", "غرفة مشطبة بشباك uPVC من ضلفتين"),
  homeWindow3: p(homeWindow3, "uPVC window in a bedroom, finished and furnished", "شباك uPVC في غرفة نوم بعد التشطيب والفرش"),
  accHandles: p(accHandles, "Window and door handles in white, beige, grey, black and wood", "مقابض للأبواب والشبابيك بالأبيض والبيج والرمادي والأسود والخشبي"),
  accHinges: p(accHinges, "Standard, heavy-duty and 3D hinges on uPVC frames", "مفصلات قياسية وكبيرة التحمل و3D على قطاعات uPVC"),
  accSlidingRollers: p(accSlidingRollers, "Sliding roller carriage with twin Teflon wheels", "عجل سلايد بعجلتين من التفلون"),
  accConcealedRollers: p(accConcealedRollers, "Large concealed rollers for heavy sliding systems", "عجل دفن كبير للأنظمة الثقيلة"),
  accEspagnolette: p(accEspagnolette, "Espagnolette multi-point lock fitted along a sash", "سبليونة غلق متعدد النقاط على الضلفة"),
  accStrikers: p(accStrikers, "Strikers for sliding, hinged and door systems", "مقابلات للسلايد والمفصلي والأبواب"),
  accExtras: p(accExtras, "Dust brush, connectors and an opening restrictor", "فرشة مانعة للأتربة وفوالع ومحدد فتح"),
  glassClear: p(glassClear, "Clear glass with an open city view", "زجاج شفاف بإطلالة واضحة على المدينة"),
  glassReflective: p(glassReflective, "Reflective glass catching the sunset", "زجاج عاكس يعكس ضوء الغروب"),
  glassFume: p(glassFume, "Fumé tinted glass in a sliding window", "زجاج فاميه داكن في شباك سحاب"),
  glassDouble: p(glassDouble, "Cross-section of a double-glazed unit", "مقطع في وحدة زجاج مزدوج"),
  slatPerforated: p(slatPerforated, "Perforated roller-shutter slats that let light and air through", "شرائح شاتر مثقبة تسمح بمرور الضوء والهواء"),
  slatNgs: p(slatNgs, "NGS roller-shutter slats with extra insulation", "شرائح شاتر NGS بعزل أعلى"),
  slatBk: p(slatBk, "BK roller-shutter slats, the everyday economical choice", "شرائح شاتر BK الاقتصادية الشائعة"),
  installTeam: p(installTeam, "A VARANDA installer fitting a uPVC sliding window", "فني من VARANDA يركّب شباك uPVC سحاب"),
} satisfies Record<string, Photo>;

export type PhotoKey = keyof typeof photos;
