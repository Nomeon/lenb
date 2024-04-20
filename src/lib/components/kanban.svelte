<script lang="ts">
	import { flip } from 'svelte/animate';
	import { dndzone, TRIGGERS } from 'svelte-dnd-action';
	import * as Card from '$lib/components/ui/card';
	import * as Collapsible from '$lib/components/ui/collapsible';
    import * as AlertDialog from '$lib/components/ui/alert-dialog';
    import { Skeleton } from "$lib/components/ui/skeleton";
	import { Button } from '$lib/components/ui/button';
	import Icon from '@iconify/svelte';
	import { read, utils } from 'xlsx';

	export let columnItems: any[];
	const flipDurationMs = 100;
	let dropDisabled: any = [];
	let fileInput: HTMLInputElement;
    let alertOpen = false;
    let selectedId: number;
    let loading = false;

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
		return Math.round((columnItems
			.find((c: Column) => c.id === cid)
			.items.reduce((acc: number, item: Item) => acc + item.uren, 0)) * 100) / 100;
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

    function setDeleteItem(itemId: number) {
        selectedId = itemId;
        alertOpen = true;
    }

    async function deleteItem() {
        console.log(selectedId)
        const response = await fetch('/api/deleteItem', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ itemId: selectedId })
        });

        if (response.status === 200) {
            // Remove item from column with id 1
            columnItems[0].items = columnItems[0].items.filter((i: Item) => i.id !== selectedId);
            columnItems = [...columnItems];
            console.log('Item deleted')
        } else {
            console.log('Error deleting item')
        }

        selectedId = 0;
    }

	const loadXLSX = async (e: any) => {
        loading = true;
		const file = e.target.files[0];
		const fileContent = await file.arrayBuffer();
		const workbook = read(fileContent);
		const data = utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
        
        // Purely for testing purposes
        const filteredData = data.filter((row: any) => row.afdeling === 'Frezen hal 1');
        const filteredData2 = filteredData.filter((row: any) => row.StartWk.includes('16'));
        const columns = ['Planpl', 'PlanpO', 'Bew', 'Bemand%', 'Uren', 'Serie', 'Matnr.', 'Omschr'];
        const filteredData3 = filteredData2.map((row: any) => {
			const newRow: any = {};
			columns.forEach((column) => {
				newRow[column] = row[column];
			});
			return newRow;
		});

        // Rename columns to match database
        const renamedColumns = {
            'Planpl': 'planpl',
            'PlanpO': 'planpo',
            'Bew': 'bewerking',
            'Bemand%': 'bemand',
            'Uren': 'uren',
            'Serie': 'aantal',
            'Matnr.': 'matnr',
            'Omschr': 'omschrijving'
        };

        const renamedData = filteredData3.map((row: any) => {
            const newRow: any = {};
            Object.keys(row).forEach((key: string) => {
                newRow[renamedColumns[key as keyof typeof renamedColumns]] = row[key];
                newRow['startdatum'] = null;
                newRow['machineId'] = 1;
            });
            return newRow;
        });

        const response = await fetch('/api/importItems', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ items: renamedData })
        });

        if (response.status === 200) {
            const items = await response.json();
            columnItems[0].items = items;
            columnItems = [...columnItems];
            console.log('Items imported');
        } else {
            console.log('Error importing items');
        }
        loading = false;
	};
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
					<input
						type="file"
						accept=".xlsx"
						bind:this={fileInput}
						class="hidden"
						on:change={(e) => loadXLSX(e)}
					/>
					<Button
						on:click={() => {
							fileInput.click();
						}}
						class="p-2"
					>
						Importeren
					</Button>
				{/if}
			</div>
			<div
				class="h-full overflow-y-scroll no-scrollbar pb-8"
				use:dndzone={{
					items: column.items,
					flipDurationMs,
					dropFromOthersDisabled: checkIfDropDisabled(column.id) // check for dropDisabled
				}}
				on:consider={(e) => handleSort(column.id, e)}
				on:finalize={(e) => updateSort(column.id, e)}
			>
                {#if loading && column.id === 1}
                    {#each Array(7) as _}
                        <Card.Root class='my-2 p-4'>
                            <div class='flex justify-between items-center'>
                                <div class='flex flex-col gap-2 py-2'>
                                    <Skeleton class="w-20 h-4" />
                                    <Skeleton class="w-12 h-4" />
                                </div>
                                <div class='flex gap-2'>
                                    <Skeleton class="h-[36px] w-[30px]" />
                                    <Skeleton class="h-[36px] w-[30px]" />

                                </div>
                            </div>
                        </Card.Root>
                    {/each}
                {/if}

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
                                        <div class='flex gap-2'>
                                            <Collapsible.Trigger>
                                                <Button class="p-2">
                                                    <Icon icon="mdi:chevron-down" />
                                                </Button>
                                            </Collapsible.Trigger>
                                            {#if column.id === 1}
                                                <Button on:click={() => setDeleteItem(item.id)} class="p-2">
                                                    <Icon icon="mdi:delete" />
                                                </Button>
                                            {/if}
                                        </div>
									</div>
									<Collapsible.Content class="text-xs">
                                        <p>Omschrijving: <span class='italic'>{item.omschrijving}</span></p>
										<p>PlanPL: <span class="italic">{item.planpl}</span></p>
										<p>Matnr: <span class="italic">{item.matnr}</span></p>
										<p>Bew: <span class="italic">{item.bewerking}</span></p>
                                        <p>Bemand: <span class='italic'>{item.bemand}%</span></p>
                                        <p>Aantal: <span class='italic'>{item.aantal}</span></p>
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

<AlertDialog.Root bind:open={alertOpen}>
	<AlertDialog.Trigger />
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>Wil je deze handeling verwijderen?</AlertDialog.Title>
			<AlertDialog.Description>
				Druk op OK om de handeling te verwijderen.
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel>Annuleren</AlertDialog.Cancel>
			<AlertDialog.Action on:click={() => deleteItem()}>OK</AlertDialog.Action
			>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>