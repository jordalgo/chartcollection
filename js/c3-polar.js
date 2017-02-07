// Generated by CoffeeScript 1.11.1
(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  c3.Polar = (function(superClass) {
    extend(Polar, superClass);

    function Polar() {
      this.toPolar = bind(this.toPolar, this);
      this._style = bind(this._style, this);
      this._draw = bind(this._draw, this);
      this._update = bind(this._update, this);
      this._size = bind(this._size, this);
      this._init = bind(this._init, this);
      return Polar.__super__.constructor.apply(this, arguments);
    }

    Polar.version = 0.1;

    Polar.prototype.type = 'polar';

    Polar.prototype.layers = [];

    Polar.prototype.data = [];

    Polar.prototype.r = void 0;

    Polar.prototype.t = void 0;

    Polar.prototype.angular_range = [0, 2 * Math.PI];

    Polar.prototype.zoomable = false;

    Polar.prototype.zoom_extent = void 0;

    Polar.prototype.layer_options = void 0;

    Polar.prototype._init = function() {
      var last_touch_event, prev_scale, self, touchstart;
      if (this.r == null) {
        this.r = d3.scale.linear();
      }
      if (this.t == null) {
        this.t = d3.scale.linear();
      }
      this.layers_svg = this.content.select('svg.layers', null, true).singleton();
      this.layers_selection = this.layers_svg.select('g.layer').bind(this.layers, (function(_this) {
        return function(layer) {
          return layer.uid;
        };
      })(this)).options(this.layer_options, function(layer) {
        return layer.options;
      });
      self = this;
      this.layers_selection.all.order();
      this.layers_selection["new"].each(function(layer) {
        layer.trigger('render_start');
        layer.init(self, d3.select(this));
        return layer.trigger('render');
      });
      this.background = this.content.select('rect.background', ':first-child').singleton();
      if (this.zoomable) {
        this.radial_domain = this.r.domain()[1] - this.r.domain()[0];
        prev_scale = 1;
        this.zoomer = d3.behavior.zoom().on('zoom', (function(_this) {
          return function() {
            var center, scale;
            scale = _this.zoomer.scale();
            if (scale !== prev_scale) {
              _this.r.domain([center = _this.r.domain()[0], center + _this.radial_domain / scale]);
              _this._draw('zoom');
            }
            return prev_scale = scale;
          };
        })(this));
        if (this.zoom_extent != null) {
          this.zoomer.scaleExtent(this.zoom_extent);
        }
        this.zoomer(this.content.all);
        this.content.all.on('dblclick.zoom', null);
        last_touch_event = void 0;
        touchstart = function() {
          if (d3.event.timeStamp - (last_touch_event != null ? last_touch_event.timeStamp : void 0) < 500 && d3.event.touches.length === 1) {
            d3.event.stopPropagation();
            last_touch_event = void 0;
          }
          return last_touch_event = d3.event;
        };
        this.layers_svg.all.on('touchstart.zoom', touchstart);
        return this.background.all.on('touchstart.zoom', touchstart);
      }
    };

    Polar.prototype._size = function() {
      var j, layer, len, ref;
      this.content.all.attr('transform', 'translate(' + this.width / 2 + ',' + this.height / 2 + ')');
      this.radius = Math.min(this.width, this.height) / 2;
      this.r.range([0, this.radius - 1]);
      ref = this.layers;
      for (j = 0, len = ref.length; j < len; j++) {
        layer = ref[j];
        layer.size(this.width, this.height);
        layer.t.clamp(true).range(this.angular_range);
      }
      return this.background.position({
        x: -this.width / 2,
        y: -this.height / 2,
        width: this.width,
        height: this.height
      });
    };

    Polar.prototype._update = function(origin) {
      var j, layer, len, ref;
      this.layers_selection.update();
      ref = this.layers;
      for (j = 0, len = ref.length; j < len; j++) {
        layer = ref[j];
        layer.update(origin);
      }
      return this;
    };

    Polar.prototype._draw = function(origin) {
      var j, layer, len, ref;
      ref = this.layers;
      for (j = 0, len = ref.length; j < len; j++) {
        layer = ref[j];
        layer.draw(origin);
      }
      return this;
    };

    Polar.prototype._style = function(style_new) {
      var j, layer, len, ref;
      this.layers_selection.style();
      ref = this.layers;
      for (j = 0, len = ref.length; j < len; j++) {
        layer = ref[j];
        layer.style(style_new);
        if (!layer.rendered) {
          layer.trigger('rendered');
        }
        layer.rendered = true;
      }
      return this;
    };

    Polar.toPolar = function(x, y) {
      return [Math.atan(y / x) + (0.5 + (x < 0 ? 1 : 0)) * Math.PI, Math.sqrt(x * x + y * y)];
    };

    Polar.prototype.toPolar = function(x, y) {
      var radius, ref, theta;
      ref = c3.Polar.toPolar(x, y), theta = ref[0], radius = ref[1];
      if (theta > this.t.range()[1] && this.t.range()[0] < 0 && theta > Math.PI) {
        theta -= 2 * Math.PI;
      }
      return [this.t.invert(theta), this.r.invert(radius)];
    };

    return Polar;

  })(c3.Chart);

  c3.Polar.Layer = (function() {
    Layer.version = 0.1;

    Layer.prototype.type = 'layer';

    Layer._next_uid = 0;

    Layer.prototype.data = void 0;

    Layer.prototype.name = void 0;

    Layer.prototype["class"] = void 0;

    Layer.prototype.r = void 0;

    Layer.prototype.t = void 0;

    Layer.prototype.options = void 0;

    Layer.prototype.handlers = void 0;

    function Layer(opt) {
      this.toPolar = bind(this.toPolar, this);
      this.redraw = bind(this.redraw, this);
      this.style = bind(this.style, this);
      this.draw = bind(this.draw, this);
      this.update = bind(this.update, this);
      this.size = bind(this.size, this);
      this.init = bind(this.init, this);
      c3.util.extend(this, new c3.Dispatch);
      c3.util.extend(this, opt);
      this.uid = c3.Polar.Layer._next_uid++;
    }

    Layer.prototype.init = function(chart, g) {
      var event, handler, prototype, ref;
      this.chart = chart;
      this.g = g;
      if (this.r == null) {
        this.r = this.chart.r;
      }
      if (this.t == null) {
        this.t = this.chart.t;
      }
      if (this.data == null) {
        this.data = this.chart.data;
      }
      if (this["class"] != null) {
        this.g.classed(this["class"], true);
      }
      if (this.handlers != null) {
        ref = this.handlers;
        for (event in ref) {
          handler = ref[event];
          this.on(event, handler);
        }
      }
      this.content = c3.select(this.g);
      prototype = Object.getPrototypeOf(this);
      while (prototype) {
        if (prototype.type != null) {
          this.g.classed(prototype.type, true);
        }
        prototype = Object.getPrototypeOf(prototype);
      }
      return this._init();
    };

    Layer.prototype._init = function() {};

    Layer.prototype.size = function(width, height) {
      this.width = width;
      this.height = height;
      this.trigger('resize_start');
      this.radius = this.chart.radius;
      if (this.r !== this.chart.r) {
        this.r.range([0, this.chart.radius - 1]);
      }
      this._size();
      return this.trigger('resize');
    };

    Layer.prototype._size = function() {};

    Layer.prototype.update = function(origin) {
      if (this.chart == null) {
        throw Error("Attempt to redraw uninitialized polar layer, please use render() when adding new layers");
      }
      return this._update(origin);
    };

    Layer.prototype._update = function() {};

    Layer.prototype.draw = function(origin) {
      this.trigger('redraw_start', origin);
      this._draw(origin);
      return this.trigger('redraw', origin);
    };

    Layer.prototype._draw = function() {};

    Layer.prototype.style = function(style_new) {
      this.trigger('restyle', style_new);
      this._style(style_new);
      this.trigger('restyle', style_new);
      return this;
    };

    Layer.prototype._style = function() {};

    Layer.prototype.redraw = function(origin) {
      if (origin == null) {
        origin = 'redraw';
      }
      this.update(origin);
      this.draw(origin);
      this.style(true);
      return this;
    };

    Layer.prototype.restyle = Layer.prototype.style;

    Layer.prototype.toPolar = function(x, y) {
      var radius, ref, theta;
      ref = c3.Polar.toPolar(x, y), theta = ref[0], radius = ref[1];
      if (theta > this.t.range()[1] && this.t.range()[0] < 0 && theta > Math.PI) {
        theta -= 2 * Math.PI;
      }
      return [this.t.invert(theta), this.r.invert(radius)];
    };

    return Layer;

  })();

  c3.Polar.Layer.Radial = (function(superClass) {
    extend(Radial, superClass);

    function Radial() {
      this._draw = bind(this._draw, this);
      return Radial.__super__.constructor.apply(this, arguments);
    }

    Radial.version = 0.1;

    Radial.prototype.type = 'radial';

    Radial.prototype.key = void 0;

    Radial.prototype.value = void 0;

    Radial.prototype.filter = void 0;

    Radial.prototype.inner_radius = 0;

    Radial.prototype.outer_radius = 2e308;

    Radial.prototype.vector_options = void 0;

    Radial.prototype.line_options = void 0;

    Radial.prototype._init = function() {
      var drag_value, self;
      if (this.value == null) {
        this.value = function(d) {
          return d;
        };
      }
      if (this.draggable) {
        self = this;
        drag_value = void 0;
        this.dragger = d3.behavior.drag();
        this.dragger.on('dragstart', (function(_this) {
          return function(d, i) {
            d3.event.sourceEvent.stopPropagation();
            return _this.trigger('dragstart', d, i);
          };
        })(this));
        this.dragger.on('drag', function(d, i) {
          var depth, ref;
          ref = self.toPolar(d3.event.x, d3.event.y), drag_value = ref[0], depth = ref[1];
          d3.select(this).attr('transform', 'rotate(' + (self.t(drag_value) * 180 / Math.PI - 180) + ')');
          return self.trigger('drag', drag_value, d, i);
        });
        return this.dragger.on('dragend', (function(_this) {
          return function(d, i) {
            return _this.trigger('dragend', drag_value, d, i);
          };
        })(this));
      }
    };

    Radial.prototype._update = function(origin) {
      var d, i;
      this.current_data = this.filter != null ? (function() {
        var j, len, ref, results;
        ref = this.data;
        results = [];
        for (i = j = 0, len = ref.length; j < len; i = ++j) {
          d = ref[i];
          if (this.filter(d, i)) {
            results.push(d);
          }
        }
        return results;
      }).call(this) : this.data;
      this.vectors = this.content.select('g.vector').options(this.vector_options).animate(origin === 'redraw').bind(this.current_data, this.key).update();
      return this.lines = this.vectors.inherit('line').options(this.line_options).update();
    };

    Radial.prototype._draw = function(origin) {
      var inner_radius, line_position, outer_radius;
      inner_radius = c3.functor(this.inner_radius);
      outer_radius = c3.functor(this.outer_radius);
      if (origin !== 'rebase') {
        this.vectors.animate(origin === 'redraw' || origin === 'revalue').position({
          transform: (function(_this) {
            return function(d, i) {
              return 'rotate(' + ((_this.t(_this.value(d, i))) * 180 / Math.PI - 180) + ')';
            };
          })(this)
        });
      } else {
        this.vectors.animate(true).position_tweens({
          transform: (function(_this) {
            return function(d, i) {
              return function(t) {
                return 'rotate(' + ((_this.t(_this.value(d, i))) * 180 / Math.PI - 180) + ')';
              };
            };
          })(this)
        });
      }
      this.lines.animate(origin === 'redraw' || origin === 'rebase').position(line_position = {
        y1: (function(_this) {
          return function(d, i) {
            return _this.r(inner_radius(d, i));
          };
        })(this),
        y2: (function(_this) {
          return function(d, i) {
            var r;
            return _this.r((r = outer_radius(d, i)) !== 2e308 ? r : window.innerHeight + window.innerWidth);
          };
        })(this)
      });
      if (this.draggable) {
        this.vectors["new"].call(this.dragger);
        return this.grab_lines = this.vectors.inherit('line.grab').animate(origin === 'redraw' || origin === 'rebase').position(line_position);
      }
    };

    Radial.prototype._style = function(style_new) {
      this.g.classed('draggable', this.draggable);
      this.vectors.style(style_new);
      return this.lines.style(style_new);
    };

    return Radial;

  })(c3.Polar.Layer);

  c3.Polar.Layer.Segment = (function(superClass) {
    extend(Segment, superClass);

    function Segment() {
      this.get_position_from_key = bind(this.get_position_from_key, this);
      this._style = bind(this._style, this);
      this._draw = bind(this._draw, this);
      this._update = bind(this._update, this);
      this._init = bind(this._init, this);
      return Segment.__super__.constructor.apply(this, arguments);
    }

    Segment.version = 0.1;

    Segment.prototype.type = 'segment';

    Segment.prototype.key = void 0;

    Segment.prototype.value = void 0;

    Segment.prototype.limit_elements = void 0;

    Segment.prototype.pad = void 0;

    Segment.prototype.arc_options = void 0;

    Segment.prototype._init = function() {
      var base, ref;
      if ((ref = this.arc_options) != null ? ref.animate : void 0) {
        if ((base = this.arc_options).animate_old == null) {
          base.animate_old = true;
        }
      }
      this.arc = d3.svg.arc().innerRadius((function(_this) {
        return function(d) {
          return Math.max(0, _this.r(d.y1));
        };
      })(this)).outerRadius((function(_this) {
        return function(d) {
          return Math.max(0, _this.r(d.y2));
        };
      })(this)).startAngle((function(_this) {
        return function(d) {
          return _this.t(d.x1);
        };
      })(this)).endAngle((function(_this) {
        return function(d) {
          return _this.t(d.x2);
        };
      })(this)).padAngle(this.pad);
      this.segments = this.content.select('g.segments').singleton();
      return this.nodes = [];
    };

    Segment.prototype._update = function(origin) {
      this.current_data = this._layout(this.data, origin);
      if (this.current_data.length > this.limit_elements) {
        if (this.current_data === this.data) {
          this.current_data = this.data.slice(0);
        }
        c3.array.sort_up(this.current_data, this.value);
        this.current_data = this.current_data.slice(-this.limit_elements);
      }
      return this.arcs = this.segments.select('path').options(this.arc_options).animate(origin === 'redraw' || origin === 'revalue' || origin === 'rebase').bind(this.current_data, this.key).update();
    };

    Segment.prototype._draw = function(origin) {
      var new_r_domain, new_t_domain, prev_t_domain, r_interpolation, ref, root_node, t_interpolation;
      if (this.tree != null) {
        root_node = this.root_datum != null ? this.nodes[this.key(this.root_datum)] : {
          x1: 0,
          x2: 1,
          y1: -1
        };
        prev_t_domain = (ref = (origin !== 'rebase' ? this.prev_t_domain : void 0)) != null ? ref : this.t.domain();
        this.prev_t_domain = [root_node.x1, root_node.x2];
        new_t_domain = [root_node.x1, root_node.x2];
        new_r_domain = [root_node.y1, root_node.y1 + this.r.domain()[1] - this.r.domain()[0]];
        t_interpolation = d3.interpolate(prev_t_domain, new_t_domain);
        r_interpolation = d3.interpolate(this.r.domain(), new_r_domain);
        this.r.domain(new_r_domain);
        this.t.domain(new_t_domain);
      }
      this.arcs.animate(origin === 'redraw' || origin === 'revalue' || origin === 'rebase').position_tweens({
        'd': (function(_this) {
          return function(d) {
            var arc_interpolation, node, ref1, ref2, ref3, ref4;
            node = _this.nodes[_this.key(d)];
            arc_interpolation = d3.interpolateObject({
              x1: (ref1 = node.px1) != null ? ref1 : node.x1,
              x2: (ref2 = node.px2) != null ? ref2 : node.x2,
              y1: (ref3 = node.py1) != null ? ref3 : node.y1,
              y2: (ref4 = node.py2) != null ? ref4 : node.y2
            }, node);
            return function(t) {
              if (_this.tree != null) {
                _this.t.domain(t_interpolation(t));
                _this.r.domain(r_interpolation(t));
              }
              return _this.arc(arc_interpolation(t));
            };
          };
        })(this)
      });
      if (origin === 'zoom') {
        return this.arcs.old.remove();
      }
    };

    Segment.prototype._style = function(style_new) {
      return this.arcs.style(style_new);
    };

    Segment.prototype.get_position_from_key = function(key) {
      var ref;
      return (ref = this.nodes) != null ? ref[key] : void 0;
    };

    return Segment;

  })(c3.Polar.Layer);

  c3.Polar.Layer.Arc = (function(superClass) {
    extend(Arc, superClass);

    function Arc() {
      this._layout = bind(this._layout, this);
      return Arc.__super__.constructor.apply(this, arguments);
    }

    Arc.version = 0.1;

    Arc.prototype.type = 'arc';

    Arc.prototype.inner_radius = 0;

    Arc.prototype.outer_radius = 1;

    Arc.prototype.start_angle = 0;

    Arc.prototype.end_angle = 2 * Math.PI;

    Arc.prototype._layout = function(data) {
      var d, end_angle, i, inner_radius, j, key, len, node, outer_radius, start_angle;
      start_angle = c3.functor(this.start_angle);
      end_angle = c3.functor(this.end_angle);
      inner_radius = c3.functor(this.inner_radius);
      outer_radius = c3.functor(this.outer_radius);
      for (i = j = 0, len = data.length; j < len; i = ++j) {
        d = data[i];
        key = this.key(d, i);
        node = this.nodes[key];
        this.nodes[key] = {
          px1: node != null ? node.x1 : void 0,
          px2: node != null ? node.x2 : void 0,
          py1: node != null ? node.y1 : void 0,
          py2: node != null ? node.y2 : void 0,
          x1: start_angle(d, i),
          x2: end_angle(d, i),
          y1: inner_radius(d, i),
          y2: outer_radius(d, i)
        };
      }
      return data;
    };

    return Arc;

  })(c3.Polar.Layer.Segment);

  c3.Polar.Layer.Pie = (function(superClass) {
    extend(Pie, superClass);

    function Pie() {
      this._style = bind(this._style, this);
      this._draw = bind(this._draw, this);
      this._layout = bind(this._layout, this);
      this._init = bind(this._init, this);
      return Pie.__super__.constructor.apply(this, arguments);
    }

    Pie.version = 0.1;

    Pie.prototype.type = 'pie';

    Pie.prototype.sort = false;

    Pie.prototype.inner_radius = 0;

    Pie.prototype.outer_radius = 1;

    Pie.prototype.other_options = void 0;

    Pie.prototype._init = function() {
      Pie.__super__._init.apply(this, arguments);
      if (this.key == null) {
        throw Error("key() accessor required for Pie charts");
      }
    };

    Pie.prototype._layout = function(data) {
      var angle, d, delta, inner_radius, j, k, key, len, len1, node, outer_radius, total;
      inner_radius = c3.functor(this.inner_radius);
      outer_radius = c3.functor(this.outer_radius);
      total = 0;
      for (j = 0, len = data.length; j < len; j++) {
        d = data[j];
        total += this.value(d);
      }
      angle = 0;
      delta = 1 / (total || 1);
      if (this.sort) {
        data = data.slice(0);
        c3.array.sort_down(data, this.value);
      }
      for (k = 0, len1 = data.length; k < len1; k++) {
        d = data[k];
        key = this.key(d);
        node = this.nodes[key];
        this.nodes[key] = {
          px1: node != null ? node.x1 : void 0,
          px2: node != null ? node.x2 : void 0,
          py1: node != null ? node.y1 : void 0,
          py2: node != null ? node.y2 : void 0,
          x1: angle,
          x2: angle += this.value(d) * delta,
          y1: inner_radius(d),
          y2: outer_radius(d)
        };
      }
      return data;
    };

    Pie.prototype._draw = function(origin) {
      Pie.__super__._draw.apply(this, arguments);
      if (this.other_options) {
        this.other_arc = this.content.select('path.other').options(this.other_options).animate(origin === 'redraw');
        if (this.data.length > this.limit_elements && this.sort === true) {
          return this.other_arc.singleton().update().position_tweens({
            'd': (function(_this) {
              return function(d, i) {
                var interpolate, other_node, ref;
                other_node = {
                  x1: _this.nodes[_this.key(_this.current_data[0])].x2,
                  x2: 1,
                  y1: c3.functor(_this.inner_radius)(),
                  y2: c3.functor(_this.outer_radius)()
                };
                interpolate = d3.interpolateObject((ref = _this.prev_other_node) != null ? ref : other_node, other_node);
                _this.prev_other_node = other_node;
                return function(t) {
                  return _this.arc(interpolate(t));
                };
              };
            })(this)
          });
        } else {
          return this.other_arc.bind([]);
        }
      }
    };

    Pie.prototype._style = function(style_new) {
      var ref;
      Pie.__super__._style.apply(this, arguments);
      return (ref = this.other_arc) != null ? ref.style(style_new) : void 0;
    };

    return Pie;

  })(c3.Polar.Layer.Segment);

  c3.Polar.Layer.Sunburst = (function(superClass) {
    extend(Sunburst, superClass);

    function Sunburst() {
      this.get_leaf = bind(this.get_leaf, this);
      this._style = bind(this._style, this);
      this._draw = bind(this._draw, this);
      this._update = bind(this._update, this);
      this.rebase_key = bind(this.rebase_key, this);
      this.rebase = bind(this.rebase, this);
      this._layout = bind(this._layout, this);
      this._init = bind(this._init, this);
      return Sunburst.__super__.constructor.apply(this, arguments);
    }

    Sunburst.version = 0.1;

    Sunburst.prototype.type = 'sunburst';

    Sunburst.prototype.self_value = void 0;

    Sunburst.prototype.sort = false;

    Sunburst.prototype.parent_key = void 0;

    Sunburst.prototype.children_keys = void 0;

    Sunburst.prototype.children = void 0;

    Sunburst.prototype.limit_angle_percentage = 0.001;

    Sunburst.prototype.root_datum = null;

    Sunburst.prototype._init = function() {
      var base, base1, base2, base3, base4;
      Sunburst.__super__._init.apply(this, arguments);
      if (this.key == null) {
        throw Error("key() accessor required for Sunburst layers");
      }
      if (this.arc_options == null) {
        this.arc_options = {};
      }
      if ((base = this.arc_options).events == null) {
        base.events = {};
      }
      if ((base1 = this.arc_options.events).click == null) {
        base1.click = (function(_this) {
          return function(d) {
            var ref;
            return _this.rebase_key((ref = (d === _this.root_datum ? _this.parent_key : _this.key)(d)) != null ? ref : null);
          };
        })(this);
      }
      this.bullseye = this.content.select('circle.bullseye');
      if (this.bullseye_options == null) {
        this.bullseye_options = {};
      }
      if ((base2 = this.bullseye_options).events == null) {
        base2.events = {};
      }
      if ((base3 = this.bullseye_options.events).click == null) {
        base3.click = (function(_this) {
          return function() {
            return _this.rebase(null);
          };
        })(this);
      }
      if ((base4 = this.bullseye_options).title == null) {
        base4.title = "Navigate to root of tree";
      }
      return this.center = this.content.select('circle.center').singleton();
    };

    Sunburst.prototype._layout = function(data, origin) {
      if (origin !== 'revalue' && origin !== 'rebase') {
        this.tree = new c3.Layout.Tree({
          key: this.key,
          parent_key: this.parent_key,
          children_keys: this.children_keys,
          children: this.children,
          value: this.value,
          self_value: this.self_value
        });
        this.nodes = this.tree.construct(data);
      }
      if (origin !== 'rebase') {
        this.value = this.tree.revalue();
      }
      return this.tree.layout(this.sort, this.limit_angle_percentage, this.root_datum);
    };

    Sunburst.prototype.rebase = function(root_datum) {
      this.root_datum = root_datum;
      this.trigger('rebase_start', this.root_datum);
      this.chart.redraw('rebase');
      return this.trigger('rebase', this.root_datum);
    };

    Sunburst.prototype.rebase_key = function(root_key) {
      var ref;
      return this.rebase((ref = this.nodes[root_key]) != null ? ref.datum : void 0);
    };

    Sunburst.prototype._update = function(origin) {
      Sunburst.__super__._update.apply(this, arguments);
      this.center.options(this.center_options).update();
      return this.bullseye.options(this.bullseye_options).animate(origin === 'redraw' || origin === 'rebase').bind(this.root_datum != null ? [this.root_datum] : []).update();
    };

    Sunburst.prototype._draw = function(origin) {
      Sunburst.__super__._draw.apply(this, arguments);
      this.bullseye.animate(origin === 'redraw').position({
        r: Math.max(0, this.r(this.r.domain()[0] + 0.5))
      });
      if (origin !== 'rebase') {
        return this.center.animate(origin === 'redraw').position({
          r: Math.max(0, this.r(this.root_datum != null ? this.nodes[this.key(this.root_datum)].y2 : 0))
        });
      }
    };

    Sunburst.prototype._style = function(style_new) {
      Sunburst.__super__._style.apply(this, arguments);
      this.center.style(style_new);
      return this.bullseye.style(style_new);
    };

    Sunburst.prototype.get_leaf = function(position) {
      var get_leaf;
      if (this.tree != null) {
        get_leaf = function(nodes, parent) {
          var j, len, node;
          for (j = 0, len = nodes.length; j < len; j++) {
            node = nodes[j];
            if (!((node.x1 <= position && position <= node.x2))) {
              continue;
            }
            if (node.children.length) {
              return get_leaf(node.children, node);
            }
            return node.datum;
          }
          return parent.datum;
        };
        return get_leaf(this.tree.root_nodes);
      }
    };

    return Sunburst;

  })(c3.Polar.Layer.Segment);

}).call(this);

//# sourceMappingURL=c3-polar.js.map
