/*:
 * @target MV MZ
 * @plugindesc Skip video on key press (version 1.0)
 * @author Dmytryk (Dmy, Demetrius) from Garbata Team
 * @url https://рпг.укр/плагін/DMY_SkipVideo.js
 *
 * @help This plugin allows to skip videos by pressing the Escape key
 * or Enter key.
 *
 * Works in both RPG Maker MV and MZ.
 *
 * This plugin is placed into public domain according to the CC0 public domain
 * dedication. See https://creativecommons.org/publicdomain/zero/1.0/ for more
 * information.
 *
 * @param Disabler switch
 * @desc Number of switch. Allows to disable the plugin when the switch is OFF.
 * If set to 0, the plugin will always work.
 * @type number
 * @default 0
 */
/*:ru
 * @target MV MZ
 * @plugindesc Сбросить видео при нажатии на клавишу (версия 1.0)
 * @author Dmytryk (Dmy, Demetrius) из команды Гарбата
 * @url https://рпг.укр/плагін/DMY_SkipVideo.js
 *
 * @help Этот плагин позволяет пропустить видео, нажав на клавиши Escape или
 * Enter.
 *
 * Работает и в RPG Maker MV, и в RPG Maker MZ.
 *
 * Этот плагин передан в общественное достояние согласно CC0. Подробнее см. на
 * странице https://creativecommons.org/publicdomain/zero/1.0/deed.ru
 *
 * @param Disabler switch
 * @text Переключатель для отключения
 * @desc Номер переключателя. Позволяет отключить плагин, когда переключатель
 * ВКЛ. Если указать 0, то плагин будет работать всегда.
 * @type number
 * @default 0
 */
 /*:uk
  * @target MV MZ
  * @plugindesc Скинути відео при натисканні на клавішу (версія 1.0)
  * @author Dmytryk (Dmy, Demetrius) з команди Гарбата
  * @url https://рпг.укр/плагін/DMY_SkipVideo.js
  *
  * @help Цей плагін дозволяє пропустити відео, натиснувши на клавіші Escape
  * або Enter.
  *
  * Працює і в RPG Maker MV, і в RPG Maker MZ.
  *
  * Цей плагін передано до суспільного надбання згідно з CC0. Детальніше див.
  * на сторінці https://creativecommons.org/publicdomain/zero/1.0/deed.uk
  *
  * @param Disabler switch
  * @text Перемикач для вимкнення
  * @desc Номер перемикача. Дозволяє відключити плагін, коли перемикач
  * УВІМкнено. Якщо вказати 0, плагін працюватиме завжди.
  * @type number
  * @default 0
  */
  /*:uk
   * @target MV MZ
   * @plugindesc Скінуць відэа націсканнем на клавішу (версія 1.0)
   * @author Dmytryk (Dmy, Demetrius) з каманды Гарбата
   * @url https://рпг.укр/плагін/DMY_SkipVideo.js
   *
   * @help Гэты плагін дазваляє прапусціць відэа, націснуўшы на клавішы Escape
   * ці Enter.
   *
   * Працуе і ў RPG Maker MV, і ў RPG Maker MZ.
   *
   * Гэты плагін пярэданы ў грамадскі набытак згодна з CC0. Падрабязней гл. на
   * старонцы https://creativecommons.org/publicdomain/zero/1.0/deed.be
   *
   * @param Disabler switch
   * @text Пераключальнік для выключэння
   * @desc Нумар пераключальніка. Дазваляє адключыць плагін, калі пераключальнік
   * УКЛючаны. Калі ўказаць 0, плагін будзе працаваць заўсёды.
   * @type number
   * @default 0
   */

if (typeof Imported === 'undefined') {
  Imported = {};
}
Imported.DMY_SkipVideo = '1.0';

(function () {

  var parameters = PluginManager.parameters('DMY_SkipVideo');
  var disablerSwitch = Number(parameters['Disabler switch']);

  function videoIsSkippable() {
    if (disablerSwitch === 0 || isNaN(disablerSwitch)) {
      return true;
    }

    return !$gameSwitches.value(disablerSwitch);
  }

  function getVideoElement() {
    if (Utils.RPGMAKER_NAME == 'MZ') {
      return Video._element;
    } else {
      return Graphics._video;
    }
  }

  var _Scene_Map_update = Scene_Map.prototype.update;
  Scene_Map.prototype.update = function () {
    var isVideoPlaying = Utils.RPGMAKER_NAME == 'MZ' ? Video.isPlaying()
                              : Graphics.isVideoPlaying();

    if (isVideoPlaying && (Input.isTriggered('menu')
                                        || Input.isTriggered('escape')
                                        || Input.isTriggered('cancel')
                                        || Input.isTriggered('ok')
                                        || TouchInput.isCancelled())
                                  && videoIsSkippable()) {

      var videoElement = getVideoElement();

      if (videoElement && 'pause' in videoElement
              && typeof videoElement.pause === 'function') {
        videoElement.pause();
        if (Utils.RPGMAKER_NAME == 'MZ') {
          Video._onEnd();
        } else {
          Graphics._onVideoEnd();
        }

      }
    }
    else {
      _Scene_Map_update.call(this);
    }
  }

})();