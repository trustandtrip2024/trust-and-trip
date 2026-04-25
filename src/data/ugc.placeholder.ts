// TODO: Replace with real Instagram / UGC entries once permissions are sourced.
// Names are intentionally generic — never invent real-looking traveler names here.

export type UgcPlaceholder = {
  id: string;
  __placeholder: true;
  firstName: string;
  destination: string;
  image: string; // /img/ugc/*.jpg or remote — supply real before launch
};

export const UGC_PLACEHOLDER: UgcPlaceholder[] = [
  { id: "ugc-1",  __placeholder: true, firstName: "Traveler 1",  destination: "Bali",        image: "/img/ugc/placeholder-1.jpg" },
  { id: "ugc-2",  __placeholder: true, firstName: "Traveler 2",  destination: "Maldives",    image: "/img/ugc/placeholder-2.jpg" },
  { id: "ugc-3",  __placeholder: true, firstName: "Traveler 3",  destination: "Switzerland", image: "/img/ugc/placeholder-3.jpg" },
  { id: "ugc-4",  __placeholder: true, firstName: "Traveler 4",  destination: "Kerala",      image: "/img/ugc/placeholder-4.jpg" },
  { id: "ugc-5",  __placeholder: true, firstName: "Traveler 5",  destination: "Spiti",       image: "/img/ugc/placeholder-5.jpg" },
  { id: "ugc-6",  __placeholder: true, firstName: "Traveler 6",  destination: "Ladakh",      image: "/img/ugc/placeholder-6.jpg" },
  { id: "ugc-7",  __placeholder: true, firstName: "Traveler 7",  destination: "Japan",       image: "/img/ugc/placeholder-7.jpg" },
  { id: "ugc-8",  __placeholder: true, firstName: "Traveler 8",  destination: "Char Dham",   image: "/img/ugc/placeholder-8.jpg" },
  { id: "ugc-9",  __placeholder: true, firstName: "Traveler 9",  destination: "Thailand",    image: "/img/ugc/placeholder-9.jpg" },
  { id: "ugc-10", __placeholder: true, firstName: "Traveler 10", destination: "Dubai",       image: "/img/ugc/placeholder-10.jpg" },
];
