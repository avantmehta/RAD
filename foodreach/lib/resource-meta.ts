export type ResourceMeta = {
  foodTypes: string[];
  idRequired: boolean | null;
  languages: string[];
  wheelchairAccessible: boolean | null;
  freshFood: boolean | null;
  attributeNote: string;
};

// Pilot attributes derived from the linked program descriptions. A null value is
// intentional: the public source did not establish the answer well enough to filter on it.
export const resourceMeta: Record<string, ResourceMeta> = {
  manna: { foodTypes: ['Groceries', 'Emergency bags'], idRequired: null, languages: ['English'], wheelchairAccessible: null, freshFood: true, attributeNote: 'Food categories are directory-reported; access details need provider confirmation.' },
  west: { foodTypes: ['Groceries'], idRequired: true, languages: ['English'], wheelchairAccessible: true, freshFood: true, attributeNote: 'Photo ID and local-address evidence are published requirements.' },
  east: { foodTypes: ['Groceries', 'Distribution'], idRequired: null, languages: ['English'], wheelchairAccessible: true, freshFood: true, attributeNote: 'First come, first served; distribution may end when supplies run out.' },
  bloom: { foodTypes: ['Groceries'], idRequired: true, languages: ['English'], wheelchairAccessible: true, freshFood: null, attributeNote: 'Residency proof and an application are published requirements.' },
  newington: { foodTypes: ['Groceries'], idRequired: true, languages: ['English'], wheelchairAccessible: true, freshFood: null, attributeNote: 'Household documentation and registration are published requirements.' },
  wethersfield: { foodTypes: ['Groceries'], idRequired: null, languages: ['English'], wheelchairAccessible: true, freshFood: null, attributeNote: 'Appointment and current pickup hours must be confirmed.' },
  fern: { foodTypes: ['Groceries'], idRequired: null, languages: ['English'], wheelchairAccessible: null, freshFood: true, attributeNote: 'Eligibility and food mix should be confirmed before travel.' },
  anja: { foodTypes: ['Kosher groceries'], idRequired: null, languages: ['English'], wheelchairAccessible: null, freshFood: null, attributeNote: 'Kosher pantry; eligibility and appointment must be confirmed.' },
  sorrows: { foodTypes: ['Groceries'], idRequired: null, languages: ['English'], wheelchairAccessible: null, freshFood: null, attributeNote: 'Rear entrance; other access details are unknown.' },
  living: { foodTypes: ['Groceries'], idRequired: null, languages: ['English'], wheelchairAccessible: null, freshFood: null, attributeNote: 'Eligibility and distribution date need confirmation.' },
  grace: { foodTypes: ['Groceries'], idRequired: null, languages: ['English'], wheelchairAccessible: null, freshFood: null, attributeNote: 'Requirements and food mix need confirmation.' },
  hispanic: { foodTypes: ['Groceries'], idRequired: null, languages: ['English', 'Spanish'], wheelchairAccessible: null, freshFood: null, attributeNote: 'Spanish support is directory-reported; call first to arrange access.' },
  kings: { foodTypes: ['Groceries'], idRequired: null, languages: ['English'], wheelchairAccessible: null, freshFood: null, attributeNote: 'Requirements and food mix need confirmation.' },
  malta: { foodTypes: ['Groceries', 'Outdoor distribution'], idRequired: null, languages: ['English'], wheelchairAccessible: null, freshFood: true, attributeNote: 'Parking-lot distribution; confirm food mix and weather changes.' },
  cathedral: { foodTypes: ['Groceries'], idRequired: null, languages: ['English'], wheelchairAccessible: null, freshFood: null, attributeNote: 'Requirements and food mix need confirmation.' },
};
