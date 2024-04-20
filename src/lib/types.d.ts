declare module '@event-calendar/time-grid';
declare module '@event-calendar/core';
declare module '@event-calendar/interaction';

type Column = {
	id: number;
	naam: string;
	capaciteit: number;
	items: Item[];
};

type Item = {
	id: number;
	planpo: string;
	uren: number;
	planpl: string;
	bewerking: string;
	matnr: string;
	omschrijving: string;
    bemand: number;
	aantal?: number;
	startdatum?: Date | string | null;
};

type DropDisabled = {
	id: number;
	dropDisabled: boolean;
};
