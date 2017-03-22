import React, {Component, PropTypes} from 'react';
import Select from '../../components/Select';
import Button from '../../components/Button';

class CitiesSearch extends Component {
    static propTypes = {
        selectedCityFrom: PropTypes.string,
        selectedCityTo: PropTypes.string,
        lastCityFrom: PropTypes.string,
        lastCityTo: PropTypes.string,
        onCityChange: PropTypes.func,
        onFlightsSearch: PropTypes.func,
        getCities: PropTypes.func
    };

    constructor(props) {
        super(props);

        this.state = this.handleCitiesEqual(props.selectedCityFrom, props.selectedCityTo);
        this.handleCityFromChange = this._handleCityFromChange.bind(this);
        this.handleCityToChange = this._handleCityToChange.bind(this);
    }

    _handleCityFromChange(city) {
        this.handleCityChange(city, 'From', 'To');
    }

    _handleCityToChange(city) {
        this.handleCityChange(city, 'To', 'From');
    }

    handleCityChange(city, from, to) {
        let state = Object.assign({}, this.handleCityNotFound(city, from));
        let otherCity = this.props['selectedCity' + to];
        if (city && otherCity) Object.assign(state, this.handleCitiesEqual(city._id, otherCity));
        this.setState(state);
        this.props.onCityChange(city && city._id, from, this.canSearch(city && otherCity, state));
    }

    handleCityNotFound(city, fromTo) {
        if (!city) return {['errorCity' + fromTo]: 'City not found'};
        return {['errorCity' + fromTo]: null};
    }

    handleCitiesEqual(cityFromId, cityToId) {
        if (cityFromId == cityToId) {
            return {errorCityTo: 'Select another city'};
        }
        return {errorCityTo: null};
    }

    canSearch(cityFrom = this.props.selectedCityFrom, cityTo = this.props.selectedCityTo, state = this.state) {
        return cityFrom && cityTo && !state.errorCityTo;
    }

    render() {
        return (
            <form className="row">
                <Select
                    className="medium-5 columns"
                    error={this.state.errorCityFrom}
                    readOnly={!!this.props.lastCityFrom}
                    getCollection={this.props.getCities}
                    itemId={this.props.selectedCityFrom}
                    nameField="name" placeholder="Where you want to start"
                    onChange={this.handleCityFromChange}
                >From city</Select>

                <Select
                    className="medium-5 columns"
                    error={this.state.errorCityTo}
                    readOnly={!!this.props.lastCityTo}
                    getCollection={this.props.getCities}
                    itemId={this.props.selectedCityTo}
                    nameField="name" placeholder="Where you travel"
                    onChange={this.handleCityToChange}
                >To city</Select>

                <div className="medium-2 columns">
                    <Button
                        className="inline-button"
                        onClick={this.props.onFlightsSearch}
                        disabled={!this.canSearch()}
                    >Search</Button>
                </div>
            </form>
        );
    }
}

export default CitiesSearch;
