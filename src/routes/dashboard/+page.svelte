<script lang='ts'>
    import { onMount } from 'svelte';
    import Kanban from '$lib/components/kanban.svelte';
    import type { PageData } from "./$types";

    export let data: PageData;
    let kanbanData: any = [];

    onMount(() => {
        kanbanData = data.response;
    })

</script>

{#if kanbanData}
    <Kanban columnItems={kanbanData} />
{/if}