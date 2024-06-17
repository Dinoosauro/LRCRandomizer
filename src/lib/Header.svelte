<script lang="ts">
    import { onMount } from "svelte";

    let header: HTMLElement;
    window.addEventListener("resize", () => {
        header && checkHeader();
    });
    /**
     * Move the header at the left if not all the content can be seen
     */
    function checkHeader() {
        header.style.justifyContent =
            Math.floor(header.scrollWidth) >
            Math.floor(header.getBoundingClientRect().width)
                ? "left"
                : "center";
    }
    onMount(checkHeader);
</script>

<header bind:this={header} class="flex hcenter">
    <img src="./icon.svg" width="48" height="48" style="margin-right: 10px;" />
    <h1 style="text-align: center; font-size: clamp(14px, 8vw, 36px)">
        LRCRandomizer
    </h1>
</header>
