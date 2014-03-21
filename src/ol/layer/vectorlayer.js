goog.provide('ol.layer.Vector');

goog.require('goog.array');
goog.require('goog.object');
goog.require('ol.feature');
goog.require('ol.layer.Layer');



/**
 * @constructor
 * @extends {ol.layer.Layer}
 * @param {olx.layer.VectorOptions=} opt_options Options.
 * @todo stability experimental
 */
ol.layer.Vector = function(opt_options) {

  var options = goog.isDef(opt_options) ?
      opt_options : /** @type {olx.layer.VectorOptions} */ ({});

  var baseOptions = goog.object.clone(options);

  delete baseOptions.style;
  goog.base(this, /** @type {olx.layer.LayerOptions} */ (baseOptions));

  /**
   * User provided style.
   * @type {ol.style.Style|Array.<ol.style.Style>|ol.feature.StyleFunction}
   * @private
   */
  this.style_ = null;

  /**
   * Style function for use within the library.
   * @type {ol.feature.StyleFunction|undefined}
   * @private
   */
  this.styleFunction_ = undefined;

  if (goog.isDef(options.style)) {
    this.setStyle(options.style);
  }

};
goog.inherits(ol.layer.Vector, ol.layer.Layer);


/**
 * Get the style for features.  This returns whatever was passed to the `style`
 * option at construction or to the `setStyle` method.
 * @return {ol.style.Style|Array.<ol.style.Style>|ol.feature.StyleFunction}
 *     Layer style.
 */
ol.layer.Vector.prototype.getStyle = function() {
  return this.style_;
};


/**
 * Get the style function.
 * @return {ol.feature.StyleFunction|undefined} Layer style function.
 * @todo stability experimental
 */
ol.layer.Vector.prototype.getStyleFunction = function() {
  return this.styleFunction_;
};


/**
 * Set the style for features.  This can be a single style object, an array
 * of styles, or a function that takes a feature and resolution and returns
 * an array of styles.
 * @param {ol.style.Style|Array.<ol.style.Style>|ol.feature.StyleFunction} style
 *     Layer style.
 * @todo stability experimental
 */
ol.layer.Vector.prototype.setStyle = function(style) {
  this.style_ = style;
  this.styleFunction_ = ol.feature.createStyleFunction(style);
  this.dispatchChangeEvent();
};
