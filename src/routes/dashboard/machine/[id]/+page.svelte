<script lang="ts">
	import type { PageData } from './$types';
	import * as Card from '$lib/components/ui/card';
	import * as Collapsible from '$lib/components/ui/collapsible';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import { Button } from '$lib/components/ui/button';
	import Icon from '@iconify/svelte';
	import Calendar from '@event-calendar/core';
	import TimeGrid from '@event-calendar/time-grid';
	import Interaction from '@event-calendar/interaction';

	export let data: PageData;

	let columnItems: Item[];

	let dialogOpen = false;
	let selectedDate: any;

	let alertOpen = false;
	let selectedId: number;

	let ec: any;
	let plugins = [TimeGrid, Interaction];
	let options = {
		view: 'timeGridWeek',
		views: {
			timeGridWeek: {
				pointer: true
			}
		},
		events: [],
		allDaySlot: false,
		buttonText: {
			today: 'Vandaag'
		},
		firstDay: 1,
		locale: 'nl-NL',
		hiddenDays: [0, 6],
		scrollTime: '07:00:00',
		dateClick: function (info: any) {
			dialogOpen = true;
			selectedDate = info.dateStr;
		},
		eventClick: function (info: any) {
			alertOpen = true;
			selectedId = info.event.id;
		},
		eventDrop: function (info: any) {
			moveItemOnCalendar(info.event.id, info.event.start);
		}
	};

	$: {
		if (data.response!.items) {
			columnItems = data.response!.items;
		}
	}

	$: {
		if (ec) {
			initCalendar();
		}
	}

	function initCalendar() {
		columnItems.forEach((item) => {
			if (item.startdatum !== null) {
				const endDate = new Date(item.startdatum!);
				endDate.setHours(endDate.getHours() + item.uren);
				endDate.setMinutes(endDate.getMinutes() + (item.uren % 1) * 60);
				endDate.toDateString();
				ec.addEvent({
					id: item.id,
					title: item.planpo,
					start: item.startdatum,
					end: endDate,
					allDay: false
				});
			}
		});
	}

	async function addItemToCalendar(itemId: any) {
		itemId = parseInt(itemId);
		const response = await editStartdatum(selectedDate, itemId);
		if (!response) {
			return;
		}

		const item = columnItems.find((item) => item.id === itemId);
		const endDate = new Date(selectedDate);
		endDate.setHours(endDate.getHours() + item!.uren);
		endDate.setMinutes(endDate.getMinutes() + (item!.uren % 1) * 60);
		endDate.toDateString();
		ec.addEvent({
			id: item!.id,
			title: item!.planpo,
			start: selectedDate,
			end: endDate,
			allDay: false
		});
		selectedDate = null;
		dialogOpen = false;
	}

	async function removeItemFromCalendar(itemId: any) {
		itemId = parseInt(itemId);
		const response = await editStartdatum('', itemId);
		if (!response) {
			return;
		}
		ec.removeEventById(itemId);
		selectedId = 0;
		alertOpen = false;
	}

	async function moveItemOnCalendar(itemId: any, startdatum: Date) {
		itemId = parseInt(itemId);
		const response = await editStartdatum(startdatum.toString(), itemId);
		if (!response) {
			return;
		}
	}

	async function editStartdatum(startdatum: string, itemId: any) {
		itemId = parseInt(itemId);
		const response = await fetch('/api/editStartdatum', {
			method: 'PATCH',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ startdatum, itemId })
		});

		if (response.status === 200) {
			if (startdatum === '') {
				const item = columnItems.find((item) => item.id === itemId);
				item!.startdatum = null;
				console.log('Startdatum removed');
				columnItems = [...columnItems];
				return true;
			}
			columnItems.find((item) => item.id === itemId)!.startdatum = new Date(startdatum);
			console.log('Startdatum edited');
			columnItems = [...columnItems];
			return true;
		} else {
			console.log('Error editing startdatum');
			return false;
		}
	}
</script>

{#if data.response && columnItems}
	<div class="flex p-2 h-dvh">
		<div class="w-80 overflow-hidden p-4 rounded-xl border-2">
			<div class="flex items-center justify-between mb-2">
				<p class="font-bold">{data.response.naam}</p>
				<Button href="/dashboard">Terug</Button>
			</div>
			<div class="h-full overflow-y-scroll no-scrollbar">
				{#each columnItems as item (item.id)}
					{#if item.startdatum === null}
						<Card.Root class="my-2">
							<Collapsible.Root>
								<Card.Content class="p-4">
									<div class="flex py-2 justify-between items-center">
										<div>
											<p class="text-xs font-bold">{item.planpo}</p>
											<p class="text-xs italic">Uren: {Math.round(item.uren * 100) / 100}</p>
										</div>
										<Collapsible.Trigger>
											<Button class="p-2">
												<Icon icon="mdi:chevron-down" />
											</Button>
										</Collapsible.Trigger>
									</div>
									<Collapsible.Content class="text-xs">
										<p>PlanPL: <span class="italic">{item.planpl}</span></p>
										<p>Bew: <span class="italic">{item.bewerking}</span></p>
										<p>Matnr.: <span class="italic">{item.matnr}</span></p>
									</Collapsible.Content>
								</Card.Content>
							</Collapsible.Root>
						</Card.Root>
					{/if}
				{/each}
			</div>
		</div>
		<div class="w-full h-dvh overflow-hidden p-4">
			<Calendar bind:this={ec} {plugins} {options} />
		</div>
	</div>
{/if}

<Dialog.Root bind:open={dialogOpen}>
	<Dialog.Trigger />
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Kies een handeling om toe te voegen:</Dialog.Title>
		</Dialog.Header>
		<div class="flex flex-col gap-2">
			{#each columnItems as item (item.id)}
				{#if item.startdatum === null}
					<Card.Root>
						<Collapsible.Root>
							<Card.Content class="p-4">
								<div class="flex py-2 justify-between items-center">
									<div>
										<p class="text-xs font-bold">{item.planpo}</p>
										<p class="text-xs italic">Uren: {Math.round(item.uren * 100) / 100}</p>
									</div>
									<div>
										<Collapsible.Trigger>
											<Button class="p-2">
												<Icon icon="mdi:chevron-down" />
											</Button>
										</Collapsible.Trigger>
										<Button on:click={() => addItemToCalendar(item.id)} class="p-2 ml-2">
											<Icon icon="mdi:table-add" />
										</Button>
									</div>
								</div>
								<Collapsible.Content class="text-xs">
									<p>PlanPL: <span class="italic">{item.planpl}</span></p>
									<p>Bew: <span class="italic">{item.bewerking}</span></p>
									<p>Matnr.: <span class="italic">{item.matnr}</span></p>
								</Collapsible.Content>
							</Card.Content>
						</Collapsible.Root>
					</Card.Root>
				{/if}
			{/each}
		</div>
	</Dialog.Content>
</Dialog.Root>

<AlertDialog.Root bind:open={alertOpen}>
	<AlertDialog.Trigger />
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>Wil je deze handeling verwijderen?</AlertDialog.Title>
			<AlertDialog.Description>
				Druk op OK om de handeling uit de planning te halen.
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel>Annuleren</AlertDialog.Cancel>
			<AlertDialog.Action on:click={() => removeItemFromCalendar(selectedId)}>OK</AlertDialog.Action
			>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
