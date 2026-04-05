import { system, ItemDurabilityComponent, EntityEquippableComponent, EquipmentSlot } from "@minecraft/server"

function reduceDurability(player, item, reduceAmount) {
    const comp = item.getComponent(ItemDurabilityComponent.componentId);
    if (!comp) return item;
    const reducedAmount = reduceAmount + comp.damage;
    if (reducedAmount >= comp.maxDurability) {
        player.dimension.playSound("random.break", player.location);
        return undefined;
    } else {
        comp.damage = reducedAmount;
        return item;
    }
}

export function entityGetSlot(entity, slot) {
    if (!entity || !entity.isValid) return;

    let equipment = entity.getComponent(EntityEquippableComponent.componentId)
    if (!equipment || !equipment.isValid) return;
    
    let containerSlot = equipment.getEquipmentSlot(slot);
    return containerSlot;
}

system.beforeEvents.startup.subscribe(ev => {
    ev.itemComponentRegistry.registerCustomComponent("beastboy:tuff_pickaxe_component", {
        onMineBlock({block, itemStack, source}) {
            if (source.typeId != "minecraft:player") return
            const slot = entityGetSlot(source, EquipmentSlot.Mainhand)
            if (!slot.getItem() || slot.getItem().typeId != itemStack.typeId) return
            slot.setItem(reduceDurability(source, itemStack, 3))

            const p = block.location
            const dimension = block.dimension
            const startCoordString = `${p.x - 1} ${p.y} ${p.z - 1}`
            const endCoordString = `${p.x + 1} ${p.y} ${p.z + 1}`
            dimension.runCommand(`fill ${startCoordString} ${endCoordString} minecraft:air destroy`)
            dimension.spawnParticle("beastboy:tuff_pickaxe_mine", p)
        }
    })
})