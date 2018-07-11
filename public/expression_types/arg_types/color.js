import React from 'react';
import PropTypes from 'prop-types';
import { EuiFlexGroup, EuiFlexItem } from '@elastic/eui';
import { templateFromReactComponent } from '../../lib/template_from_react_component';
import { ColorPickerMini } from '../../components/color_picker_mini/';

const ColorArgInput = ({ onValueChange, argValue, workpad }) => (
  <EuiFlexGroup gutterSize="s">
    <EuiFlexItem grow={false}>
      <ColorPickerMini value={argValue} onChange={onValueChange} colors={workpad.colors} />
    </EuiFlexItem>
  </EuiFlexGroup>
);

ColorArgInput.propTypes = {
  argValue: PropTypes.any.isRequired,
  onValueChange: PropTypes.func.isRequired,
  workpad: PropTypes.shape({
    colors: PropTypes.array.isRequired,
  }).isRequired,
};

export const color = () => ({
  name: 'color',
  displayName: 'Color',
  help: 'Color picker',
  simpleTemplate: templateFromReactComponent(ColorArgInput),
  default: '#000000',
});
