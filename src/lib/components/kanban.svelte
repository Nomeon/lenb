<script lang="ts">
	import { flip } from 'svelte/animate';
	import { dndzone, TRIGGERS } from 'svelte-dnd-action';
	import * as Card from '$lib/components/ui/card';
	import * as Collapsible from '$lib/components/ui/collapsible';
	import { Button } from '$lib/components/ui/button';
	import Icon from '@iconify/svelte';

	export let columnItems: any[];
	const flipDurationMs = 100;
	let dropDisabled: any = [];

	$: {
		if (columnItems) {
			dropDisabled = [];
			columnItems.forEach((c: Column) => {
				const disabled = getColumnUren(c.id) > c.capaciteit;
				dropDisabled.push({
					id: c.id,
					dropDisabled: disabled
				});
			});
		}
	}

	function handleSort(cid: number, e: any) {
		const { trigger, id } = e.detail.info;
		if (trigger === TRIGGERS.DRAG_STARTED) {
			const currentItem = columnItems.find((c) => c.id === cid).items.find((i: any) => i.id === id);
			const currentItemUren = parseFloat(currentItem.uren);
			columnItems.forEach((c: Column) => {
				if (c.id !== cid) {
					if (getColumnUren(c.id) + currentItemUren > c.capaciteit) {
						dropDisabled.find((d: DropDisabled) => d.id === c.id).dropDisabled = true;
					} else {
						dropDisabled.find((d: DropDisabled) => d.id === c.id).dropDisabled = false;
					}
				}
			});
			dropDisabled = [...dropDisabled];
		}
		const colIdx = columnItems.findIndex((c: Column) => c.id === cid);
		columnItems[colIdx].items = e.detail.items;
		columnItems = [...columnItems];
	}

	function updateSort(cid: number, e: any) {
		if (e.detail.info.trigger === TRIGGERS.DROPPED_INTO_ZONE) {
			moveItem(cid, parseInt(e.detail.info.id));
		}
		const colIdx = columnItems.findIndex((c: Column) => c.id === cid);
		columnItems[colIdx].items = e.detail.items;
		columnItems = [...columnItems];
	}

	// Implement function to check if item can be dropped into column
	function checkIfDropDisabled(cid: number): boolean {
		return dropDisabled.find((d: DropDisabled) => d.id === cid).dropDisabled;
	}

	function getColumnUren(cid: number) {
		return columnItems
			.find((c: Column) => c.id === cid)
			.items.reduce((acc: number, item: Item) => acc + item.uren, 0);
	}

	async function moveItem(cid: number, itemId: number) {
		const response = await fetch('/api/moveItem', {
			method: 'PATCH',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ cid, itemId })
		});

		if (response.status === 200) {
			columnItems = [...columnItems];
			console.log('Item moved');
		} else {
			console.log('Error moving item');
		}
	}
</script>

<section class="w-full h-full grid gap-2 p-2 grid-cols-6 grid-rows-2">
	{#each columnItems as column (column.id)}
		<div
			class="overflow-hidden h-full p-4 rounded-xl border-2 {column.id === 1
				? 'row-span-2'
				: 'row-span-1'}
                {getColumnUren(column.id) > column.capaciteit ? 'bg-red-100' : ''}
                "
			animate:flip={{ duration: flipDurationMs }}
		>
			<div class="flex justify-between mb-2">
				{#if column.naam !== 'Nog te plannen'}
					<a href="/dashboard/machine/{column.id}" class="font-bold flex items-center gap-2"
						><Icon icon="mdi:factory" />{column.naam}</a
					>
					<span>{getColumnUren(column.id)}/{column.capaciteit}</span>
				{:else}
					<p class="font-bold flex items-center gap-2">{column.naam}</p>
					<span>{getColumnUren(column.id)}</span>
				{/if}
			</div>
			<div
				class="h-full overflow-y-scroll no-scrollbar"
				use:dndzone={{
					items: column.items,
					flipDurationMs,
					dropFromOthersDisabled: checkIfDropDisabled(column.id) // check for dropDisabled
				}}
				on:consider={(e) => handleSort(column.id, e)}
				on:finalize={(e) => updateSort(column.id, e)}
			>
				{#each column.items as item (item.id)}
					<div animate:flip={{ duration: flipDurationMs }}>
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
					</div>
				{/each}
			</div>
		</div>
	{/each}
</section>
