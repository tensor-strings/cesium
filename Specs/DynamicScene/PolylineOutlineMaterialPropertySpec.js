/*global defineSuite*/
defineSuite([
        'DynamicScene/PolylineOutlineMaterialProperty',
        'Core/Color',
        'Core/JulianDate',
        'Core/TimeInterval',
        'DynamicScene/ConstantProperty',
        'DynamicScene/TimeIntervalCollectionProperty'
    ], function(
        PolylineOutlineMaterialProperty,
        Color,
        JulianDate,
        TimeInterval,
        ConstantProperty,
        TimeIntervalCollectionProperty) {
    "use strict";
    /*global jasmine,describe,xdescribe,it,xit,expect,beforeEach,afterEach,beforeAll,afterAll,spyOn,runs,waits,waitsFor*/

    it('constructor provides the expected defaults', function() {
        var property = new PolylineOutlineMaterialProperty();
        expect(property.getType()).toEqual('PolylineOutline');

        var result = property.getValue();
        expect(result.color).toEqual(Color.WHITE);
        expect(result.outlineColor).toEqual(Color.BLACK);
        expect(result.outlineWidth).toEqual(0.0);
    });

    it('works with constant values', function() {
        var property = new PolylineOutlineMaterialProperty();
        property.color = new ConstantProperty(Color.RED);
        property.outlineColor = new ConstantProperty(Color.BLUE);

        var result = property.getValue(JulianDate.now());
        expect(result.color).toEqual(Color.RED);
        expect(result.outlineColor).toEqual(Color.BLUE);
    });

    it('works with undefined values', function() {
        var property = new PolylineOutlineMaterialProperty();
        property.color.setValue(undefined);
        property.outlineColor.setValue(undefined);

        var result = property.getValue();
        expect(result.hasOwnProperty('color')).toEqual(true);
        expect(result.hasOwnProperty('outlineColor')).toEqual(true);
        expect(result.color).toBeUndefined();
        expect(result.outlineColor).toBeUndefined();
    });

    it('works with dynamic values', function() {
        var property = new PolylineOutlineMaterialProperty();
        property.color = new TimeIntervalCollectionProperty();
        property.outlineColor = new TimeIntervalCollectionProperty();

        var start = new JulianDate(1, 0);
        var stop = new JulianDate(2, 0);
        property.color.intervals.addInterval(new TimeInterval(start, stop, true, true, Color.BLUE));
        property.outlineColor.intervals.addInterval(new TimeInterval(start, stop, true, true, Color.RED));

        var result = property.getValue(start);
        expect(result.color).toEqual(Color.BLUE);
        expect(result.outlineColor).toEqual(Color.RED);
    });

    it('works with a result parameter', function() {
        var property = new PolylineOutlineMaterialProperty();
        property.color = new ConstantProperty(Color.RED);
        property.outlineColor = new ConstantProperty(Color.BLUE);

        var result = {
            color : Color.YELLOW.clone(),
            outlineColor : Color.BROWN.clone()
        };
        var returnedResult = property.getValue(JulianDate.now(), result);
        expect(returnedResult).toBe(result);
        expect(result.color).toEqual(Color.RED);
        expect(result.outlineColor).toEqual(Color.BLUE);
    });

    it('equals works', function() {
        var left = new PolylineOutlineMaterialProperty();
        left.color = new ConstantProperty(Color.WHITE);
        left.outlineColor = new ConstantProperty(Color.BLACK);
        left.outlineWidth = new ConstantProperty(5);

        var right = new PolylineOutlineMaterialProperty();
        right.color = new ConstantProperty(Color.WHITE);
        right.outlineColor = new ConstantProperty(Color.BLACK);
        right.outlineWidth = new ConstantProperty(5);
        expect(left.equals(right)).toEqual(true);

        right.color = new ConstantProperty(Color.RED);
        expect(left.equals(right)).toEqual(false);

        right.color = left.color;
        right.outlineColor = new ConstantProperty(Color.BLUE);
        expect(left.equals(right)).toEqual(false);

        right.outlineColor = left.outlineColor;
        right.outlineWidth = new ConstantProperty(6);
        expect(left.equals(right)).toEqual(false);
    });

    it('raises definitionChanged when a property is assigned or modified', function() {
        var property = new PolylineOutlineMaterialProperty();
        var listener = jasmine.createSpy('listener');
        property.definitionChanged.addEventListener(listener);

        var oldValue = property.color;
        property.color = new ConstantProperty(Color.RED);
        expect(listener).toHaveBeenCalledWith(property, 'color', property.color, oldValue);
        listener.reset();

        property.color.setValue(Color.YELLOW);
        expect(listener).toHaveBeenCalledWith(property, 'color', property.color, property.color);
        listener.reset();

        property.color = property.color;
        expect(listener.callCount).toEqual(0);
        listener.reset();

        oldValue = property.outlineColor;
        property.outlineColor = new ConstantProperty(Color.BLUE);
        expect(listener).toHaveBeenCalledWith(property, 'outlineColor', property.outlineColor, oldValue);
        listener.reset();

        property.outlineColor.setValue(Color.GREEN);
        expect(listener).toHaveBeenCalledWith(property, 'outlineColor', property.outlineColor, property.outlineColor);
        listener.reset();

        property.outlineColor = property.outlineColor;
        expect(listener.callCount).toEqual(0);

        oldValue = property.outlineWidth;
        property.outlineWidth = new ConstantProperty(2.5);
        expect(listener).toHaveBeenCalledWith(property, 'outlineWidth', property.outlineWidth, oldValue);
        listener.reset();

        property.outlineWidth.setValue(1.5);
        expect(listener).toHaveBeenCalledWith(property, 'outlineWidth', property.outlineWidth, property.outlineWidth);
        listener.reset();

        property.outlineWidth = property.outlineWidth;
        expect(listener.callCount).toEqual(0);
    });

    it('isConstant is only true when all properties are constant or undefined', function() {
        var property = new PolylineOutlineMaterialProperty();
        expect(property.isConstant).toBe(true);

        property.color = undefined;
        property.outlineColor = undefined;
        property.outlineWidth = undefined;
        expect(property.isConstant).toBe(true);

        var start = new JulianDate(1, 0);
        var stop = new JulianDate(2, 0);
        property.color = new TimeIntervalCollectionProperty();
        property.color.intervals.addInterval(new TimeInterval(start, stop, true, true, Color.RED));
        expect(property.isConstant).toBe(false);

        property.color = undefined;
        expect(property.isConstant).toBe(true);
        property.outlineColor = new TimeIntervalCollectionProperty();
        property.outlineColor.intervals.addInterval(new TimeInterval(start, stop, true, true, Color.BLUE));
        expect(property.isConstant).toBe(false);

        property.outlineColor = undefined;
        expect(property.isConstant).toBe(true);
        property.outlineWidth = new TimeIntervalCollectionProperty();
        property.outlineWidth.intervals.addInterval(new TimeInterval(start, stop, true, true, 2.0));
        expect(property.isConstant).toBe(false);
    });
});