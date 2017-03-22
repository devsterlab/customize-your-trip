import React, {Component, PropTypes} from 'react';
import Select from '../../components/Select';
import InputNumber from '../../components/InputNumber';

class Filtering extends Component {
    static propTypes = {
        filters: PropTypes.object,
        brands: PropTypes.arrayOf(PropTypes.shape({
            name: PropTypes.string
        })),
        models: PropTypes.arrayOf(PropTypes.shape({
            name: PropTypes.string
        })),
        carTypes: PropTypes.arrayOf(PropTypes.shape({
            name: PropTypes.string
        })),
        errorbrand: PropTypes.string,
        errormodel: PropTypes.string,
        errorcarType: PropTypes.string,
        onFilterChange: PropTypes.func
    };

    constructor(props) {
        super(props);

        this.state = {
            maxPassChecked: !!props.filters.maxPassengers,
            maxPassengers: props.filters.maxPassengers || 10
        };
    }

    handleTransmissionChange(type, checked) {
        let otherType = type == 'manual' ? 'automatic' : 'manual';
        let transmissionFilter;
        if (checked || this.props.filters.transmission[otherType])
            transmissionFilter = Object.assign({}, this.props.filters.transmission, {[type]: checked});
        this.props.onFilterChange('transmission', transmissionFilter && {name: transmissionFilter});
    }

    handleMaxPassCheckChange() {
        let checked = !this.state.maxPassChecked;
        this.props.onFilterChange('maxPassengers', checked && {name: this.state.maxPassengers});
        this.setState({maxPassChecked: checked});
    }

    handleMaxPassengersChange(num) {
        this.props.onFilterChange('maxPassengers', {name: num});
        this.setState({maxPassengers: num});
    }

    render() {
        return (
            <div className="medium-3 columns filtering">
                <h4>Filtering</h4>

                <Select
                    nameField="name"
                    error={this.props.errorbrand}
                    clearButton
                    itemName={this.props.filters.brand}
                    collection={this.props.brands}
                    onChange={brand => this.props.onFilterChange('brand', brand)}
                >Brand</Select>

                <Select
                    nameField="name"
                    error={this.props.errormodel}
                    clearButton
                    readOnly={!this.props.filters.brand}
                    itemName={this.props.filters.model}
                    collection={this.props.models}
                    onChange={model => this.props.onFilterChange('model', model)}
                >Model</Select>

                <Select
                    nameField="name"
                    error={this.props.errorcarType}
                    clearButton
                    itemName={this.props.filters.carType}
                    collection={this.props.carTypes}
                    onChange={carType => this.props.onFilterChange('carType', carType)}
                >Car Type</Select>

                <fieldset>
                    <legend>Transmission</legend>
                    <input
                        type="checkbox"
                        value="manual"
                        id="trManual"
                        checked={this.props.filters.transmission && this.props.filters.transmission.manual}
                        onChange={e => this.handleTransmissionChange('manual', e.target.checked)}
                    />
                    <label htmlFor="trManual">Manual</label>

                    <input
                        type="checkbox"
                        value="automatic"
                        id="trAuto"
                        checked={this.props.filters.transmission && this.props.filters.transmission.automatic}
                        onChange={e => this.handleTransmissionChange('automatic', e.target.checked)}
                    />
                    <label htmlFor="trAuto">Automatic</label>
                </fieldset>

                <fieldset>
                    <label>Max passengers
                        <input
                            type="checkbox"
                            checked={this.state.maxPassChecked}
                            className="max-pass-check"
                            onChange={() => this.handleMaxPassCheckChange()}
                        />
                        <InputNumber
                            min={2}
                            max={10}
                            value={this.state.maxPassengers}
                            readOnly={!this.state.maxPassChecked}
                            onChange={num => this.handleMaxPassengersChange(num)}
                        />
                    </label>
                </fieldset>
            </div>
        );
    }
}

export default Filtering;
