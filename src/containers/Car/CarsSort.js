import React, { Component, PropTypes } from 'react';
import Sort from '../../components/Sort';

class CarsSort extends Component {
    static propTypes = {
        sorting: PropTypes.shape({
            field: PropTypes.string,
            asc: PropTypes.bool
        }),
        onSortChange: PropTypes.func
    };

    shouldComponentUpdate(props) {
        return props.sorting !== this.props.sorting;
    }

    render() {
        return (
            <div>
                <h4 className="inline">Sort by:</h4>

                <Sort selected={this.props.sorting.field == 'brand'}
                      asc={this.props.sorting.asc}
                      onClick={asc => this.props.onSortChange('brand', asc)}
                >brand</Sort>

                <Sort selected={this.props.sorting.field == 'model'}
                      asc={this.props.sorting.asc}
                      onClick={asc => this.props.onSortChange('model', asc)}
                >model</Sort>

                <Sort selected={this.props.sorting.field == 'price'}
                      asc={this.props.sorting.asc}
                      onClick={asc => this.props.onSortChange('price', asc)}
                >price</Sort>

                <Sort selected={this.props.sorting.field == 'carType'}
                      asc={this.props.sorting.asc}
                      onClick={asc => this.props.onSortChange('carType', asc)}
                >carType</Sort>
            </div>
        );
    }
}

export default CarsSort;
