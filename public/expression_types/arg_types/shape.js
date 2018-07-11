import React from 'react';
import PropTypes from 'prop-types';
import { EuiFlexGroup, EuiFlexItem } from '@elastic/eui';
import { shapes } from '../../render_functions/shape/shapes';
import { templateFromReactComponent } from '../../lib/template_from_react_component';
import { ShapePickerMini } from '../../components/shape_picker_mini/';

const ShapeArgInput = ({ onValueChange, argValue }) => (
  <EuiFlexGroup gutterSize="s">
    <EuiFlexItem grow={false}>
      <ShapePickerMini value={argValue} onChange={onValueChange} shapes={shapes} />
    </EuiFlexItem>
  </EuiFlexGroup>
);

ShapeArgInput.propTypes = {
  argValue: PropTypes.any.isRequired,
  onValueChange: PropTypes.func.isRequired,
};

export const shape = () => ({
  name: 'shape',
  displayName: 'Shape',
  help: 'Shape picker',
  simpleTemplate: templateFromReactComponent(ShapeArgInput),
  default: '"square"',
});
