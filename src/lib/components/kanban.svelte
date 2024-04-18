<script lang="ts">
	import { flip } from 'svelte/animate';
	import { dndzone, type DndEvent, type Item, TRIGGERS } from 'svelte-dnd-action';
	import * as Card from '$lib/components/ui/card';
	import * as Collapsible from '$lib/components/ui/collapsible';
	import { Button } from '$lib/components/ui/button';
	import Icon from '@iconify/svelte';
	import { onMount } from 'svelte';

    export let columnItems: any[];
    const flipDurationMs = 100;
    let dropDisabled: any = [];

    onMount(async() => {
        await columnItems.forEach((c) => {
            const columnUren = c.items.reduce(
                (acc: number, item: { Uren: string }) => acc + parseFloat(item.Uren),
                0
            );
            const disabled = columnUren > c.capaciteit;
            dropDisabled.push({
                id: c.id,
                dropDisabled: disabled
            })
        });

        console.log(columnItems)
    });

    function handleDndConsiderCards(cid: any, e: CustomEvent<DndEvent<Item>>) {
        const { trigger, id } = e.detail.info;
        if (trigger === TRIGGERS.DRAG_STARTED) {
            const currentItem = columnItems
                .find((c) => c.id === cid)
                .items.find((i) => i.id === id);
            const currentItemUren = parseFloat(currentItem.uren);
            columnItems.forEach((c) => {
                if (c.id !== cid) {
                    const columnUren = c.items.reduce(
                        (acc, item) => acc + parseFloat(item.uren),
                        0
                    );
                    if (columnUren + currentItemUren > c.capaciteit) {
                        dropDisabled.find((d) => d.id === c.id).dropDisabled = true;
                    } else {
                        dropDisabled.find((d) => d.id === c.id).dropDisabled = false;
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

    function checkIfDropDisabled(cid: any) {
        return dropDisabled.find((d) => d.id === cid).dropDisabled;
    }

</script>

<section class="w-full h-full grid grid-cols-6 grid-rows-2">
    {#each columnItems as column (column.id)}
        <div class='overflow-hidden h-full p-4 border-2 {column.id === 1 ? 'row-span-2' : 'row-span-1'}' animate:flip={{ duration: flipDurationMs }}>
            <div class="flex justify-between mb-2">
                <p class="font-bold">{column.naam}</p>
                {#if column.naam !== 'Nog te plannen'}
                    <span
                        >{column.items.reduce(
                            (acc, item) => acc + Math.round(item.uren * 100) / 100,
                            0
                        )}/{column.capaciteit}</span
                    >
                {/if}
            </div>
            <div
                class="h-full overflow-y-scroll no-scrollbar"
                use:dndzone={{
                    items: column.items,
                    flipDurationMs,
                    dropFromOthersDisabled: false // check for dropDisabled
                }}
                on:consider={(e) => handleDndConsiderCards(column.id, e)}
                on:finalize={(e) => handleDndFinalizeCards(column.id, e)}
            >
                {#each column.items as item (item.id)}
                    <div animate:flip={{ duration: flipDurationMs }}>
                        <Card.Root>
                            <Collapsible.Root>
                                <Card.Content class="p-4">
                                    <div class="flex py-2 justify-between items-center">
                                        <div>
                                            <p class="text-xs font-bold">{item.planpo}</p>
                                            <p class="text-xs italic">Uren: {Math.round(item.uren * 100) / 100}</p>
                                        </div>

                                        <Collapsible.Trigger>
                                            <Button class="p-2">
                                                <Icon icon="akar-icons:chevron-down" />
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