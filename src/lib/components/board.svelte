<script lang="ts">
	import { flip } from 'svelte/animate';
	import { dndzone, type DndEvent, type Item, TRIGGERS } from 'svelte-dnd-action';
	import * as Card from '$lib/components/ui/card';
	import * as Collapsible from '$lib/components/ui/collapsible';
	import { Button } from '$lib/components/ui/button';
	import Icon from '@iconify/svelte';

	export let columnItems: any[];
	const flipDurationMs = 100;

	function handleDndConsiderCards(cid: any, e: CustomEvent<DndEvent<Item>>) {
		const { trigger, id } = e.detail.info;
		if (trigger === TRIGGERS.DRAG_STARTED) {
			const currentItem = columnItems
				.find((c) => c.id === cid)
				.items.find((i: { id: string }) => i.id === id);
			const currentItemUren = parseFloat(currentItem.Uren);
			columnItems.forEach((c) => {
				if (c.id !== cid) {
					const columnUren = c.items.reduce(
						(acc: number, item: { Uren: string }) => acc + parseFloat(item.Uren),
						0
					);
					if (columnUren + currentItemUren > c.capacity) {
						c.dropDisabled = true;
					} else {
						c.dropDisabled = false;
					}
				}
			});
		}

		const colIdx = columnItems.findIndex((c) => c.id === cid);

		columnItems[colIdx].items = e.detail.items;
		columnItems = [...columnItems];
	}

	function handleDndFinalizeCards(cid: any, e: CustomEvent<DndEvent<Item>>) {
		const colIdx = columnItems.findIndex((c) => c.id === cid);
		columnItems[colIdx].items = e.detail.items;
		columnItems = [...columnItems];
	}
</script>

<section class="w-full flex flex-row p-4">
	{#each columnItems as column (column.id)}
		<div class="w-64 float-left border-2 p-4 m-2" animate:flip={{ duration: flipDurationMs }}>
			<div class="flex justify-between">
				<p class="font-bold">{column.name}</p>
				{#if column.name !== 'Nog te plannen'}
					<span
						>{column.items.reduce(
							(acc, item) => acc + Math.round(item.Uren * 100) / 100,
							0
						)}/{column.capacity}</span
					>
				{/if}
			</div>
			<!-- svelte-ignore a11y-no-static-element-interactions -->
			<div
				class="h-full"
				use:dndzone={{
					items: column.items,
					flipDurationMs,
					dropFromOthersDisabled: column.dropDisabled
				}}
				on:consider={(e) => handleDndConsiderCards(column.id, e)}
				on:finalize={(e) => handleDndFinalizeCards(column.id, e)}
			>
				{#each column.items as item (item.id)}
					<!-- svelte-ignore a11y-no-static-element-interactions -->
					<!-- svelte-ignore a11y-click-events-have-key-events -->
					<div class="m-2" animate:flip={{ duration: flipDurationMs }}>
						<Card.Root>
							<Collapsible.Root>
								<Card.Content class="p-4">
									<div class="flex py-2 justify-between items-center">
										<div>
											<p class="text-xs font-bold">{item.PlanpO}</p>
											<p class="text-xs italic">Uren: {Math.round(item.Uren * 100) / 100}</p>
										</div>

										<Collapsible.Trigger>
											<Button class="p-2">
												<Icon icon="akar-icons:chevron-down" />
											</Button>
										</Collapsible.Trigger>
									</div>
									<Collapsible.Content class="text-xs">
										<p>PlanPL: <span class="italic">{item.Planpl}</span></p>
										<p>Week: <span class="italic">{item.StartWk}</span></p>
										<p>Artikel: <span class="italic">{item.ProdNr}</span></p>
										<p>Matnr.: <span class="italic">{item['Matnr.']}</span></p>
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
