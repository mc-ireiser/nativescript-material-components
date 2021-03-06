import { Color } from '@nativescript/core/color';
import { screen } from '@nativescript/core/platform';
import { isUserInteractionEnabledProperty } from '@nativescript/core/ui/core/view';
import { Background } from '@nativescript/core/ui/styling/background';
import { backgroundInternalProperty } from '@nativescript/core/ui/styling/style-properties';
import { getRippleColor, themer } from 'nativescript-material-core/core';
import { dynamicElevationOffsetProperty, elevationProperty, rippleColorProperty } from 'nativescript-material-core/cssproperties';
import { CardViewBase } from './cardview-common';

// use custom class to get the same behavior as android which is
// highlight even if clicked on subview (which is not a control)

declare class ICard extends MDCCardCollectionCell {
    static new(): ICard;
    static alloc(): ICard;
}
const Card = (MDCCardCollectionCell as any).extend({
    touchesBeganWithEvent(touches, event) {
        this.super.touchesBeganWithEvent(touches, event);
        if (this.interactable) {
            this.highlighted = true;
        }
    },
    touchesEndedWithEvent(touches, event) {
        this.super.touchesEndedWithEvent(touches, event);
        this.highlighted = false;
    },
}) as typeof ICard;
export class CardView extends CardViewBase {
    nativeViewProtected: ICard;

    public createNativeView() {
        const view = Card.new();
        const colorScheme = themer.getAppColorScheme();
        if (colorScheme) {
            MDCCardsColorThemer.applySemanticColorSchemeToCardCell(colorScheme, view);
        }
        view.interactable = this.isUserInteractionEnabled;
        return view;
    }
    _setNativeClipToBounds() {
        // this.ios.clipsToBounds = true;
    }

    getDefaultElevation(): number {
        return 1;
    }

    getDefaultDynamicElevationOffset() {
        return 5;
    }

    // trick to get the same behavior as android (don't disable all children)
    [isUserInteractionEnabledProperty.setNative](value: boolean) {
        this.nativeViewProtected.interactable = value;
    }

    [elevationProperty.setNative](value: number) {
        this.nativeViewProtected.setShadowElevationForState(value, MDCCardCellState.Normal);
        let dynamicElevationOffset = this.dynamicElevationOffset;
        if (typeof dynamicElevationOffset === 'undefined' || dynamicElevationOffset === null) {
            dynamicElevationOffset = this.getDefaultDynamicElevationOffset();
        }
        if (dynamicElevationOffset === undefined) {
            this.nativeViewProtected.setShadowElevationForState(value + dynamicElevationOffset, MDCCardCellState.Highlighted);
        }
    }

    [dynamicElevationOffsetProperty.setNative](value: number) {
        let elevation = this.elevation;
        if (typeof elevation === 'undefined' || elevation === null) {
            elevation = this.getDefaultElevation();
        }
        this.nativeViewProtected.setShadowElevationForState(value + elevation, MDCCardCellState.Highlighted);
    }
    [backgroundInternalProperty.setNative](value: Background) {
        if (this.nativeViewProtected) {
            const scale = screen.mainScreen.scale;
            if (value.color) {
                this.nativeViewProtected.backgroundColor = value.color ? value.color.ios : null;
            }
            this.nativeViewProtected.setBorderWidthForState(value.borderLeftWidth / scale, MDCCardCellState.Normal);
            this.nativeViewProtected.setBorderColorForState(value.borderTopColor ? value.borderTopColor.ios : null, MDCCardCellState.Normal);
            this.nativeViewProtected.layer.cornerRadius = value.borderTopLeftRadius / scale;
        }
    }
    [rippleColorProperty.setNative](color: Color) {
        this.nativeViewProtected.inkView.inkColor = getRippleColor(color);
    }
}
