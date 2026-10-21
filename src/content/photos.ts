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
// The client's own hardware (photographed in the workshop, 2026-10-21).
import accWindowHandles from "@/assets/photos/acc-window-handles.jpg";
import accFlushHandle from "@/assets/photos/acc-flush-handle.jpg";
import acc3dHinge from "@/assets/photos/acc-3d-hinge.jpg";
import accRollers from "@/assets/photos/acc-rollers.jpg";
import accDoorEspagnolette from "@/assets/photos/acc-door-espagnolette.jpg";
import accSlidingEspagnolette from "@/assets/photos/acc-sliding-espagnolette.jpg";
import glassClear from "@/assets/profile/glass-clear.jpg";
import glassReflective from "@/assets/profile/glass-reflective.jpg";
import glassFume from "@/assets/profile/glass-fume.jpg";
import glassDouble from "@/assets/profile/glass-double.jpg";
import slatPerforated from "@/assets/profile/slat-perforated.jpg";
import slatNgs from "@/assets/profile/slat-ngs.jpg";
import slatBk from "@/assets/profile/slat-bk.jpg";
import installTeam from "@/assets/profile/install-team.jpg";
// From the client's photo archive (2017–2025), enhanced: small WhatsApp copies AI-upscaled,
// dark interiors lifted, colour corrected and given the same grade as the rest of the site.
import modernVilla from "@/assets/photos/modern-villa.jpg";
import modernVillaFront from "@/assets/photos/modern-villa-front.jpg";
import modernVillaWindow from "@/assets/photos/modern-villa-window.jpg";
import frenchDoors from "@/assets/photos/french-doors.jpg";
import frenchDoorsKitchen from "@/assets/photos/french-doors-kitchen.jpg";
import frenchDoorsWindow from "@/assets/photos/french-doors-window.jpg";
import gardenVilla from "@/assets/photos/garden-villa.jpg";
import gardenVillaWindow from "@/assets/photos/garden-villa-window.jpg";
import stoneVilla from "@/assets/photos/stone-villa.jpg";
import stoneVillaWindow from "@/assets/photos/stone-villa-window.jpg";
import redVilla from "@/assets/photos/red-villa.jpg";
import redVillaTower from "@/assets/photos/red-villa-tower.jpg";
import redVillaEntrance from "@/assets/photos/red-villa-entrance.jpg";
import seaView from "@/assets/photos/sea-view.jpg";
import seaView2 from "@/assets/photos/sea-view-2.jpg";
import seaViewFacade from "@/assets/photos/sea-view-facade.jpg";
import seaViewDoor from "@/assets/photos/sea-view-door.jpg";
import poolVilla from "@/assets/photos/pool-villa.jpg";
import poolVillaBay from "@/assets/photos/pool-villa-bay.jpg";
import pergolaPool from "@/assets/photos/pergola-pool.jpg";
import pergolaGarden from "@/assets/photos/pergola-garden.jpg";
import pergolaNight from "@/assets/photos/pergola-night.jpg";
import pergolaDeck from "@/assets/photos/pergola-deck.jpg";
import gardenGate from "@/assets/photos/garden-gate.jpg";
import universityWindows from "@/assets/photos/university-windows.jpg";
import universityCorridor from "@/assets/photos/university-corridor.jpg";
import universityFacade from "@/assets/photos/university-facade.jpg";
import roundWindows from "@/assets/photos/round-windows.jpg";
import roundWindow from "@/assets/photos/round-window.jpg";
import roundWindow2 from "@/assets/photos/round-window-2.jpg";
import archedDoors from "@/assets/photos/arched-doors.jpg";
import archedDoorsOpen from "@/assets/photos/arched-doors-open.jpg";
import foldingDoors from "@/assets/photos/folding-doors.jpg";

/** `focus` is a CSS object-position: the part of the photo to keep when a wide frame crops it. */
export type Photo = { src: StaticImageData; alt: L; focus?: string };

const p = (src: StaticImageData, en: string, ar: string, focus?: string): Photo => ({ src, alt: { en, ar }, focus });

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
  accWindowHandles: p(accWindowHandles, "Two white window handles", "مقبضان أبيضان للشبابيك"),
  accFlushHandle: p(accFlushHandle, "A white flush handle", "مقبض غاطس أبيض"),
  acc3dHinge: p(acc3dHinge, "Box of a 3D adjustable door hinge, rated to 130 kg", "علبة مفصلة باب 3D قابلة للضبط، تتحمل حتى 130 كجم"),
  accRollers: p(accRollers, "Sliding rollers: a flat track roller and two concealed twin-wheel rollers", "عجل الجرار: عجل مسطرة وعجل دفن بعجلتين"),
  accDoorEspagnolette: p(accDoorEspagnolette, "Hinged-door espagnolette with its lock case", "سبليونة باب مفصلي بعلبة الكالون"),
  accSlidingEspagnolette: p(accSlidingEspagnolette, "Sliding espagnolette bar with its locking points", "سبليونة جرار بنقاط الغلق"),
  accExtras: p(accExtras, "Dust brush, connectors and an opening restrictor", "فرشة مانعة للأتربة وفوالع ومحدد فتح"),
  glassClear: p(glassClear, "Clear glass with an open city view", "زجاج شفاف بإطلالة واضحة على المدينة"),
  glassReflective: p(glassReflective, "Reflective glass catching the sunset", "زجاج عاكس يعكس ضوء الغروب"),
  glassFume: p(glassFume, "Fumé tinted glass in a sliding window", "زجاج فاميه داكن في شباك سحاب"),
  glassDouble: p(glassDouble, "Cross-section of a double-glazed unit", "مقطع في وحدة زجاج مزدوج"),
  slatPerforated: p(slatPerforated, "Perforated roller-shutter slats that let light and air through", "شرائح شاتر مثقبة تسمح بمرور الضوء والهواء"),
  slatNgs: p(slatNgs, "NGS roller-shutter slats with extra insulation", "شرائح شاتر NGS بعزل أعلى"),
  slatBk: p(slatBk, "BK roller-shutter slats, the everyday economical choice", "شرائح شاتر BK الاقتصادية الشائعة"),
  installTeam: p(installTeam, "A VARANDA installer fitting a uPVC sliding window", "فني من VARANDA يركّب شباك uPVC سحاب"),
  modernVilla: p(modernVilla, "Modern villa with its ground-floor roller shutters down", "فيلا مودرن والشاتر مُغلق على الدور الأرضي"),
  modernVillaFront: p(modernVillaFront, "Garden side of the modern villa with large glazed doors on the ground floor", "واجهة الفيلا المودرن من ناحية الحديقة بأبواب زجاجية كبيرة في الدور الأرضي"),
  modernVillaWindow: p(modernVillaWindow, "Wide sliding window above a built-in window seat", "شباك سحاب عريض فوق مقعد مدمج"),
  frenchDoors: p(frenchDoors, "White French doors opening onto a balcony, in a room with blue walls and a marble floor", "باب فرنسي أبيض على الشرفة في غرفة بحوائط زرقاء وأرضية رخام"),
  frenchDoorsKitchen: p(frenchDoorsKitchen, "Kitchen with two white uPVC windows above the counter", "مطبخ بشباكين uPVC أبيض فوق الرخامة"),
  frenchDoorsWindow: p(frenchDoorsWindow, "White uPVC window with glazing bars in a blue dining room", "شباك uPVC أبيض بتقسيمات في غرفة طعام زرقاء"),
  gardenVilla: p(gardenVilla, "Villa terrace with roller shutters and an awning over the garden doors", "تراس فيلا بشاتر وتندة فوق أبواب الحديقة"),
  gardenVillaWindow: p(gardenVillaWindow, "Tall window with glazing bars and a decorative grille, looking onto the garden", "شباك طويل بتقسيمات وحماية زخرفية يطل على الحديقة"),
  stoneVilla: p(stoneVilla, "Arched window in a stone-clad tower, with a window below", "شباك مقوس في برج مكسو بالحجر وأسفله شباك آخر", "50% 8%"),
  stoneVillaWindow: p(stoneVillaWindow, "Arched double window above built-in drawers", "شباك مقوس بضلفتين فوق أدراج مدمجة"),
  redVilla: p(redVilla, "Villa with sliding doors on the ground floor and wide windows above", "فيلا بأبواب سحاب في الدور الأرضي وشبابيك عريضة بالأعلى"),
  redVillaTower: p(redVillaTower, "Tall window set into a round tower", "شباك طويل في برج دائري"),
  redVillaEntrance: p(redVillaEntrance, "Entrance of the villa behind flowering trees", "مدخل الفيلا خلف أشجار مزهرة"),
  seaView: p(seaView, "Sliding window framing the sea", "شباك سحاب يطل على البحر"),
  seaView2: p(seaView2, "Wide sliding window looking out to the beach", "شباك سحاب عريض يطل على الشاطئ"),
  seaViewFacade: p(seaViewFacade, "Stone-clad facade with cream sliding windows reflecting the sea", "واجهة مكسوة بالحجر بشبابيك سحاب كريمي تعكس البحر"),
  seaViewDoor: p(seaViewDoor, "Cream sliding door opening onto the terrace", "باب سحاب كريمي على التراس"),
  poolVilla: p(poolVilla, "Villa with a curved bay of windows facing the pool", "فيلا بواجهة شبابيك منحنية تطل على حمام السباحة"),
  poolVillaBay: p(poolVillaBay, "The curved bay of windows from inside, looking out to the pool", "واجهة الشبابيك المنحنية من الداخل وتطل على حمام السباحة"),
  pergolaPool: p(pergolaPool, "Wood-effect pergola beside a pool, with sun loungers", "برجولة بمظهر الخشب بجوار حمام سباحة مع كراسي استلقاء"),
  pergolaGarden: p(pergolaGarden, "Pergola with slatted screens in a landscaped garden", "برجولة بسواتر من الشرائح في حديقة منسقة"),
  pergolaNight: p(pergolaNight, "Pergola lit at dusk beside the pool", "برجولة مضاءة عند الغروب بجوار حمام السباحة"),
  pergolaDeck: p(pergolaDeck, "Pergola on a raised deck with wood-effect slats", "برجولة على منصة مرتفعة بشرائح بمظهر الخشب"),
  gardenGate: p(gardenGate, "Wood-effect fence and gate along a garden path", "سور وبوابة بمظهر الخشب على امتداد ممر الحديقة"),
  universityWindows: p(universityWindows, "Dark-frame windows overlooking a busy street", "شبابيك بإطار داكن تطل على شارع مزدحم"),
  universityCorridor: p(universityCorridor, "A row of dark-frame windows along a corridor", "صف من الشبابيك بإطار داكن على امتداد ممر"),
  universityFacade: p(universityFacade, "Building facade with dark-frame windows on every floor", "واجهة مبنى بشبابيك ذات إطار داكن في كل الأدوار"),
  roundWindows: p(roundWindows, "Reception room with two round windows and an inlaid marble floor", "غرفة استقبال بشباكين دائريين وأرضية رخام مطعّمة"),
  roundWindow: p(roundWindow, "Round window with glazing bars beneath a chandelier", "شباك دائري بتقسيمات أسفل نجفة"),
  roundWindow2: p(roundWindow2, "Round window casting sunlight across the floor", "شباك دائري يرسم ضوء الشمس على الأرضية"),
  archedDoors: p(archedDoors, "Arched doors with a fanlight, closed", "أبواب مقوسة بشباك علوي مروحي، مغلقة"),
  archedDoorsOpen: p(archedDoorsOpen, "Arched doors folded back to open the room onto the balcony", "أبواب مقوسة مطوية لتفتح الغرفة على الشرفة", "50% 22%"),
  foldingDoors: p(foldingDoors, "Folding doors opening a room onto the terrace", "أبواب طي تفتح الغرفة على التراس"),
} satisfies Record<string, Photo>;

export type PhotoKey = keyof typeof photos;
