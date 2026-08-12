export type Locale = "en" | "es";

export const dict = {
  en: {
    nav: {
      home: "Home", villas: "Luxury Villas", properties: "Properties",
      cars: "Cars", yachts: "Yachts", services: "Services",
      jets: "Luxury Jets", listProperty: "List your property",
      about: "About", contact: "Contact",
    },
    footer: {
      follow: "Follow us @CuponTours",
      brandDesc: "Discover amazing deals on luxury properties, cars, and yachts",
      platforms: "Platforms & Partnerships",
      quickLinks: "Quick Links", destinations: "Popular Destinations", operators: "Operators",
      home: "Home", aboutUs: "About Us", properties: "Properties", cars: "Cars", yachts: "Yachts",
      workWithUs: "Work with Us", investWithUs: "Invest with Us",
      ownerDashboard: "Owner Dashboard", contact: "Contact",
      terms: "Terms of Service", privacy: "Privacy Policy",
      rights: "All rights reserved.",
    },
    common: { seeMore: "See more", noItems: "No elements available in this collection at the moment." },
    home: {
      heroBadge: "Villas · Cars · Yachts · Jets · Concierge",
      heroTitleA: "Miami luxury,", heroTitleB: "fully", heroAccent: "managed.",
      heroSubtitle: "Book villas, cars, yachts and jets from one concierge — or let us run your property: dynamic pricing, Airbnb/Vrbo/Booking distribution and a real-time owner dashboard.",
      pillProperties: "Properties", pillCars: "Luxury Cars", pillYachts: "Yachts Charters",
      pillJets: "Jets", pillServices: "Services", pillVillas: "Luxury Villas",
      rowHomesPre: "Curation", rowHomesTitle: "Enjoy your stay inside one of our properties",
      rowCarsPre: "The Premium Fleet", rowCarsTitle: "Exceptional cars for ultimate performance",
      rowYachtsPre: "Yacht Charter Collection", rowYachtsTitle: "Elegance on water, designed for luxury",
      bnPropKicker: "Boutique Living", bnPropTitle: "Book Your Dream Vacation Today!",
      bnPropText: "Don't wait to create unforgettable memories. Our luxury properties offer the perfect blend of comfort and elegance for your next getaway. Reserve now and experience hospitality at its finest.",
      bnPropCta: "Explore Properties",
      bnCarsKicker: "Elite Performance", bnCarsTitle: "Drive in Style Through Miami",
      bnCarsText: "Access our premium fleet of SUVs, electric models, and sportscars tailored for your trip.",
      bnCarsCta: "View Fleet",
      bnYachtsKicker: "Nautical Elegance", bnYachtsTitle: "Set Sail On Your Next Adventure",
      bnYachtsText: "From private day charters to custom multi-cabin mega yachts on coastal waters.",
      bnYachtsCta: "Explore Charters",
      bnSvcKicker: "Concierge Collection", bnSvcTitle: "Discover Our Curated Services",
      bnSvcText: "From private transport to bespoke wellness, events, and experiences — explore our full concierge-level services collection.",
      bnSvcCta: "Explore Services",
    },
  },
  es: {
    nav: {
      home: "Inicio", villas: "Villas de Lujo", properties: "Propiedades",
      cars: "Autos", yachts: "Yates", services: "Servicios",
      jets: "Jets Privados", listProperty: "Publica tu propiedad",
      about: "Nosotros", contact: "Contacto",
    },
    footer: {
      follow: "Síguenos @CuponTours",
      brandDesc: "Descubre ofertas increíbles en propiedades, autos y yates de lujo",
      platforms: "Plataformas y Alianzas",
      quickLinks: "Enlaces rápidos", destinations: "Destinos populares", operators: "Operadores",
      home: "Inicio", aboutUs: "Nosotros", properties: "Propiedades", cars: "Autos", yachts: "Yates",
      workWithUs: "Trabaja con nosotros", investWithUs: "Invierte con nosotros",
      ownerDashboard: "Panel del propietario", contact: "Contacto",
      terms: "Términos del servicio", privacy: "Política de privacidad",
      rights: "Todos los derechos reservados.",
    },
    common: { seeMore: "Ver más", noItems: "No hay elementos disponibles en esta colección por ahora." },
    home: {
      heroBadge: "Villas · Autos · Yates · Jets · Concierge",
      heroTitleA: "Lujo en Miami,", heroTitleB: "totalmente", heroAccent: "gestionado.",
      heroSubtitle: "Reserva villas, autos, yates y jets desde un solo concierge — o déjanos operar tu propiedad: pricing dinámico, distribución en Airbnb/Vrbo/Booking y un panel del propietario en tiempo real.",
      pillProperties: "Propiedades", pillCars: "Autos de Lujo", pillYachts: "Charters de Yate",
      pillJets: "Jets", pillServices: "Servicios", pillVillas: "Villas de Lujo",
      rowHomesPre: "Curaduría", rowHomesTitle: "Disfruta tu estadía en una de nuestras propiedades",
      rowCarsPre: "La Flota Premium", rowCarsTitle: "Autos excepcionales para el máximo desempeño",
      rowYachtsPre: "Colección de Charters", rowYachtsTitle: "Elegancia sobre el agua, diseñada para el lujo",
      bnPropKicker: "Boutique Living", bnPropTitle: "¡Reserva hoy las vacaciones de tus sueños!",
      bnPropText: "No esperes para crear recuerdos inolvidables. Nuestras propiedades de lujo ofrecen la mezcla perfecta de confort y elegancia para tu próxima escapada. Reserva ahora y vive la hospitalidad al más alto nivel.",
      bnPropCta: "Explorar Propiedades",
      bnCarsKicker: "Desempeño de Élite", bnCarsTitle: "Conduce con Estilo por Miami",
      bnCarsText: "Accede a nuestra flota premium de SUVs, modelos eléctricos y deportivos a la medida de tu viaje.",
      bnCarsCta: "Ver Flota",
      bnYachtsKicker: "Elegancia Náutica", bnYachtsTitle: "Zarpa en tu Próxima Aventura",
      bnYachtsText: "Desde charters privados por el día hasta mega yates de múltiples camarotes en aguas costeras.",
      bnYachtsCta: "Explorar Charters",
      bnSvcKicker: "Colección Concierge", bnSvcTitle: "Descubre Nuestros Servicios",
      bnSvcText: "Desde transporte privado hasta bienestar, eventos y experiencias a la medida — explora toda nuestra colección de servicios de concierge.",
      bnSvcCta: "Explorar Servicios",
    },
  },
};

export function getDict(locale: Locale) {
  return dict[locale] ?? dict.en;
}

// Héroes de las páginas de catálogo (verticales).
export const verticalsDict = {
  en: {
    properties: {
      badge: "Premium Collection",
      title: "Luxury Properties for Rent",
      subtitle: "Discover exceptional vacation rentals and luxury properties. From cozy retreats to grand estates, find your perfect home.",
    },
    cars: {
      badge: "Premium Fleet",
      title: "Luxury Car Rentals in Miami",
      subtitle: "Discover our premium fleet of luxury vehicles. From elegant sedans to massive SUVs and exotic sports cars, find the perfect match to experience the city in style.",
    },
    yachts: {
      badge: "Elite Charters",
      title: "Luxury Yacht Charters in Miami",
      subtitle: "Set sail on the crystal-clear waters of Miami with our exclusive fleet of luxury yachts. From private sailing experiences to grand oceanic tours, discover the perfect vessel for your aquatic adventure.",
    },
  },
  es: {
    properties: {
      badge: "Colección Premium",
      title: "Propiedades de lujo en renta",
      subtitle: "Descubre alquileres vacacionales y propiedades de lujo excepcionales. Desde refugios acogedores hasta grandes fincas, encuentra tu hogar perfecto.",
    },
    cars: {
      badge: "Flota Premium",
      title: "Renta de autos de lujo en Miami",
      subtitle: "Descubre nuestra flota premium de vehículos de lujo. Desde sedanes elegantes hasta grandes SUVs y deportivos exóticos, encuentra el ideal para vivir la ciudad con estilo.",
    },
    yachts: {
      badge: "Charters de Élite",
      title: "Charters de yate de lujo en Miami",
      subtitle: "Zarpa en las aguas cristalinas de Miami con nuestra flota exclusiva de yates de lujo. Desde experiencias privadas de navegación hasta grandes tours oceánicos, descubre la embarcación perfecta para tu aventura.",
    },
  },
};

export function getVerticals(locale: Locale) {
  return verticalsDict[locale] ?? verticalsDict.en;
}
