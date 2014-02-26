goog.provide('ol.interaction.PointerInteraction');

goog.require('goog.asserts');
goog.require('goog.functions');
goog.require('goog.object');
goog.require('ol.MapBrowserEvent');
goog.require('ol.MapBrowserEvent.EventType');
goog.require('ol.MapBrowserPointerEvent');
goog.require('ol.Pixel');
goog.require('ol.ViewHint');
goog.require('ol.interaction.Interaction');



/**
 * Base class for pointer interactions.
 * @constructor
 * @extends {ol.interaction.Interaction}
 */
ol.interaction.PointerInteraction = function() {

  goog.base(this);

  /**
   * @type {boolean}
   * @private
   */
  this.handled_ = false;

  /**
   * @type {Object.<number, ol.pointer.PointerEvent>}
   * @private
   */
  this.trackedPointers_ = {};

  /**
   * @type {Array.<ol.pointer.PointerEvent>}
   * @protected
   */
  this.targetPointers = [];

};
goog.inherits(ol.interaction.PointerInteraction, ol.interaction.Interaction);


/**
 * @param {Array.<ol.pointer.PointerEvent>} pointerEvents
 * @return {ol.Pixel} Centroid pixel.
 */
ol.interaction.PointerInteraction.centroid = function(pointerEvents) {
  var length = pointerEvents.length;
  var clientX = 0;
  var clientY = 0;
  for (var i = 0; i < length; i++) {
    clientX += pointerEvents[i].clientX;
    clientY += pointerEvents[i].clientY;
  }
  return [clientX / length, clientY / length];
};


/**
 * @param {ol.MapBrowserPointerEvent} mapBrowserEvent Event.
 * @return {boolean} Whether the event is a pointerdown, pointerdrag
 *     or pointerup event.
 * @private
 */
ol.interaction.PointerInteraction.prototype.isPointerDraggingEvent_ =
    function(mapBrowserEvent) {
  var type = mapBrowserEvent.type;
  return (
      type === ol.MapBrowserEvent.EventType.POINTERDOWN ||
      type === ol.MapBrowserEvent.EventType.POINTERDRAG ||
      type === ol.MapBrowserEvent.EventType.POINTERUP);
};


/**
 * @param {ol.MapBrowserPointerEvent} mapBrowserEvent Event.
 * @private
 */
ol.interaction.PointerInteraction.prototype.updateTrackedPointers_ =
    function(mapBrowserEvent) {
  if (this.isPointerDraggingEvent_(mapBrowserEvent)) {
    var event = mapBrowserEvent.pointerEvent;

    if (mapBrowserEvent.type == ol.MapBrowserEvent.EventType.POINTERUP) {
      delete this.trackedPointers_[event.pointerId];
    } else if (mapBrowserEvent.type ==
        ol.MapBrowserEvent.EventType.POINTERDOWN) {
      this.trackedPointers_[event.pointerId] = event;
    } else if (event.pointerId in this.trackedPointers_) {
      // update only when there was a pointerdown event for this pointer
      this.trackedPointers_[event.pointerId] = event;
    }
    this.targetPointers = goog.object.getValues(this.trackedPointers_);
  }
};


/**
 * @param {ol.MapBrowserPointerEvent} mapBrowserEvent Event.
 * @protected
 */
ol.interaction.PointerInteraction.prototype.handlePointerDrag =
    goog.nullFunction;


/**
 * @param {ol.MapBrowserPointerEvent} mapBrowserEvent Event.
 * @protected
 * @return {boolean} Capture dragging.
 */
ol.interaction.PointerInteraction.prototype.handlePointerUp =
    goog.functions.FALSE;


/**
 * @param {ol.MapBrowserPointerEvent} mapBrowserEvent Event.
 * @protected
 * @return {boolean} Capture dragging.
 */
ol.interaction.PointerInteraction.prototype.handlePointerDown =
    goog.functions.FALSE;


/**
 * @inheritDoc
 */
ol.interaction.PointerInteraction.prototype.handleMapBrowserEvent =
    function(mapBrowserEvent) {
  goog.asserts.assertInstanceof(mapBrowserEvent, ol.MapBrowserPointerEvent);
  var mapBrowserPointerEvent =
      /** @type {ol.MapBrowserPointerEvent} */ (mapBrowserEvent);

  var view = mapBrowserEvent.map.getView();
  this.updateTrackedPointers_(mapBrowserPointerEvent);
  if (this.handled_) {
    if (mapBrowserPointerEvent.type ==
        ol.MapBrowserEvent.EventType.POINTERDRAG) {
      this.handlePointerDrag(mapBrowserEvent);
    } else if (mapBrowserPointerEvent.type ==
        ol.MapBrowserEvent.EventType.POINTERUP) {
      this.handled_ = this.handlePointerUp(mapBrowserPointerEvent);
      if (!this.handled_) {
        view.setHint(ol.ViewHint.INTERACTING, -1);
      }
    }
  }
  if (mapBrowserPointerEvent.type == ol.MapBrowserEvent.EventType.POINTERDOWN) {
    var handled = this.handlePointerDown(mapBrowserPointerEvent);
    if (!this.handled_ && handled) {
      view.setHint(ol.ViewHint.INTERACTING, 1);
    }
    this.handled_ = handled;
  }
  return true;
};
