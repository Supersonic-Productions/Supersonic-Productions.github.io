//====================================================================================
//
// Drop Items Conditions
//
//====================================================================================
/*:
 * @plugindesc v1.03 Set conditions for enemies item/equip drops.
 * Read 'Help' for more information.
 * @author Musashii
 *
 *
 * @help
 * ===================================================================================
 * Introduction
 * ===================================================================================
 *
 * You can set extra condidions to items to drop using the notetag:
 * <DropRestriction: formula>
 * Be aware that you can't use the "greater than" comparison operator
 * inside the notetag or it'll close it, use the "less than" instead.
 *
 * Use the tag <CancelRestriction: itemId> inside Enemy notes to cancel the item 
 *'itemId' restriction.
 *
 * Use the tag <ChangeRestriction:itemId,NewFormula> inside Enemy notes to change the
 * item  'itemId' restriction only for the enemy.
 * ===================================================================================
 * Notetags - Special Formula Codes
 * ===================================================================================
 * Exclusive codes you can use in your formulas:
 *
 * ElementId(id)
 *Will check if enemy was killed by a skill with a certain element (id). For 
 *multiple elements use: ElementId([id1,id2,id3])
 *You can use it inside Items and Enemies notes. Example:
 *
 *<DropRestriction:ElementId([2,4])>
 *Item will drop if enemy is killed by a skill with element 2 or 4
 *
 *<ChangeRestriction:1,ElementId([2])>
 *Enemy will drop item 1 from database only if killed by skill with element 2
 * ===================================================================================
 * Notetags - Formula Examples
 * ===================================================================================
 *
 *   Items, Weapons and Armors Notetags:
 *Here are some examples of what can be done, but you can create your own formulas!
 *
 *<DropRestriction: $gameParty.isAnyMemberEquipped($dataWeapons[id])>
 *Item will drop only if any party member have the first weapon in the
 *database equipped.
 *  
 *<DropRestriction: $gameActors.actor(actorId).equips().contains($dataArmors[id])>
 *True if actor(id) is equipped with the armor(id).
 *  
 *<DropRestriction: 100 < $gameVariables.value(id)>
 *True if variable[id] is greater than 100.
 *  
 *<DropRestriction: $gameParty.hasItem($dataItems[itemID]) &&
 *50 <= $gameActors.actor(id).level>
 *True if player has item(itemID) in the inventory AND if actor(id) has level
 *greater than or equal to 50.
 *
 *   Enemies Notetags:
 *
 *<CancelRestriction: 1>
 * Will cancel the drop condition of the first item of the database for the
 * enemy.
 *
 *<ChangeRestriction:1,$gameSwitches.value(1) === true>
 * Make a different item drop condition (will drop if switch 1 is ON, despite the 
 original condition) for the enemy.
 * ===================================================================================
 * Changelog
 * ===================================================================================
 *
 * Version 1.03:
 * - New 'killed by element' code to use in your conditions.
 * Version 1.02:
 * - Enemies can now change item drop conditions for themselves.
 * Version 1.01:
 * - Added option to cancel specified item drop restrictions for certain enemies.
 */
//====================================================================================
 var killedByElement = [];
 var indexCounter = -1;
 
(function() {

//===================================================================================
// Game_Battler.prototype.onBattleEnd
// Reset Counter after each battle
//===================================================================================
var _Game_Battler_onBattleEndResetCounter = Game_Battler.prototype.onBattleEnd;

Game_Battler.prototype.onBattleEnd = function() {
_Game_Battler_onBattleEndResetCounter.call
 indexCounter = -1;
};

//===================================================================================
// Game_Troop.prototype.makeDropItems
// REPLACE function
// Count index to get which troop's reward is being given 
//===================================================================================
Game_Troop.prototype.makeDropItems = function() {
    return this.deadMembers().reduce(function(r, enemy) {
	
 indexCounter = indexCounter + 1;

        return r.concat(enemy.makeDropItems());
    }, []);
};
 
//===================================================================================
// Game_Action.prototype.calcElementRate
// Store data (Target Index and damage element) in variable 'killedByElement'
//=================================================================================== 
 var _Game_Action_calcElementRate = Game_Action.prototype.calcElementRate;

Game_Action.prototype.calcElementRate = function(target) {
// KilledByElement[index] = [Element]
 killedByElement[target.index()] = this.item().damage.elementId
        return _Game_Action_calcElementRate.call(this, target);};		
		
//===================================================================================
// Game_Enemy.prototype.makeDropItems
// Replace makeDropItems function
//=================================================================================== 
Game_Enemy.prototype.makeDropItems = function() {

//===================================================================================
// New Function :ElementId:
// Make the formula => ElementId(id) or ElementId([id1,id2])
//=================================================================================== 
function ElementId(arrayOfElements){
return "[" + [arrayOfElements] + "]" + ".contains(killedByElement[indexCounter])";}

//
// START: CHECK CONDITIONS AND FORMULAS
//
    return this.enemy().dropItems.reduce(function(r, di) {
        if (di.kind > 0 && Math.random() * di.denominator < this.dropItemRate()) {
		
// Check if the item don't have the DropRestriction note AND a ChangeRestriction note.
  if ($dataItems[di.dataId].meta.DropRestriction === undefined && $dataEnemies[this._enemyId].meta.ChangeRestriction === undefined ){
                return r.concat(this.itemObject(di.kind, di.dataId));
                }else{ 
// Check if itemId match a possible CancelRestriction note 		
if (di.dataId === Number($dataEnemies[this._enemyId].meta.CancelRestriction)) {
return r.concat(this.itemObject(di.kind, di.dataId));}
else {
// Check if enemy have an overwriting tag <ChangeRestriction>
if  ($dataEnemies[this._enemyId].meta.ChangeRestriction === undefined){
//Don't Have <ChangeRestriction> tag, apply <DropRestriction>
     if (eval(eval($dataItems[di.dataId].meta.DropRestriction))){
                            return r.concat(this.itemObject(di.kind, di.dataId));
                                        } else{
                                        return r}
                                        } else{
// Have <ChangeRestriction> tag, check if item is the same
if (Number($dataEnemies[this._enemyId].meta.ChangeRestriction[0]) === di.dataId){
// Same Item, use <ChangeRestriction> new formula
// Start Formula will read formula after the "," in the tag
var startFormula = $dataEnemies[this._enemyId].meta.ChangeRestriction.indexOf(",",0);
			if (eval(eval($dataEnemies[this._enemyId].meta.ChangeRestriction.slice(startFormula + 1)))){
                    return r.concat(this.itemObject(di.kind, di.dataId));
                                  } else{
                                    return r}}
else{
// Item is not the same, use original information
			if (eval(eval($dataItems[di.dataId].meta.DropRestriction))){
                    return r.concat(this.itemObject(di.kind, di.dataId));
                                  } else{
                                    return r}}

								            }}}} else {
            return r;}
    }.bind(this), []);
}
 
 
 
 
 
  })();