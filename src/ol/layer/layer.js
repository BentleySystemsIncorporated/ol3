goog.provide('ol.layer.Layer');

goog.require('goog.asserts');
goog.require('goog.events');
goog.require('goog.events.EventType');
goog.require('goog.object');
goog.require('ol.layer.Base');
goog.require('ol.source.Source');



/**
 * @constructor
 * @extends {ol.layer.Base}
 * @fires ol.render.Event
 * @fires change Triggered when the state of the source changes.
 * @param {olx.layer.LayerOptions} options Layer options.
 * @todo api
 */
ol.layer.Layer = function(options) {

  var baseOptions = goog.object.clone(options);
  delete baseOptions.source;

  goog.base(this, /** @type {olx.layer.LayerOptions} */ (baseOptions));

  /**
   * @private
   * @type {ol.source.Source}
   */
  this.source_ = options.source;

  goog.events.listen(this.source_, goog.events.EventType.CHANGE,
      this.handleSourceChange_, false, this);

};
goog.inherits(ol.layer.Layer, ol.layer.Base);


/**
 * @inheritDoc
 */
ol.layer.Layer.prototype.getLayersArray = function(opt_array) {
  var array = (goog.isDef(opt_array)) ? opt_array : [];
  array.push(this);
  return array;
};


/**
 * @inheritDoc
 */
ol.layer.Layer.prototype.getLayerStatesArray = function(opt_states) {
  var states = (goog.isDef(opt_states)) ? opt_states : [];
  states.push(this.getLayerState());
  return states;
};


/**
 * @return {ol.source.Source} Source.
 * @todo api
 */
ol.layer.Layer.prototype.getSource = function() {
  return this.source_;
};


/**
  * @inheritDoc
  */
ol.layer.Layer.prototype.getSourceState = function() {
  return this.getSource().getState();
};


/**
 * @private
 */
ol.layer.Layer.prototype.handleSourceChange_ = function() {
  this.dispatchChangeEvent();
};
