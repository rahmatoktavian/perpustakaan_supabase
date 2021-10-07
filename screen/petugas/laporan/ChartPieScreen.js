import React, { Component } from 'react';
import { View, Dimensions } from 'react-native';
import { Provider as PaperProvider, Appbar, Portal, Modal, ActivityIndicator } from 'react-native-paper';
import { PieChart } from "react-native-chart-kit";

import supabase from '../../../config/supabase';
import Theme from '../../../config/Theme';
import Loading from '../../../component/Loading';

class ChartPieScreen extends Component {

  constructor(props) {
      super(props);

      this.state = {
        piechart_data: []
      }
  }

  componentDidMount() {
      this._unsubscribe = this.props.navigation.addListener('focus', () => {
        this.getData();
      });
  }

  componentWillUnmount() {
    this._unsubscribe();
  }

  getRandomColor() {
    let randomColor = 'rgb(' + (Math.floor(Math.random() * 256)) + ',' + (Math.floor(Math.random() * 256)) + ',' + (Math.floor(Math.random() * 256)) + ')';  
    return randomColor;
  }

  getChartColor(index) {
    let chartColorList = ['#4572A7', '#AA4643', '#89A54E', '#80699B', '#3D96AE',
        '#DB843D', '#92A8CD', '#A47D7C', '#B5CA92'];

    let chartColor = chartColorList[index];
    return chartColor;
  }

  async getData() {
      this.setState({isLoading:true});

      //query data supabase
      const { data, error } = await supabase
                                    .rpc('rekap_buku_perkategori')

      //convert data api menjadi format chart
        let piechart_data = [];
        //looping dari data api
        data.map((row, index) => {

          //masukin data api ke format pie chart
          piechart_data.push({
            name: row.nama,
            value: row.total_buku,
            color: this.getChartColor(index),
            legendFontColor: "#7F7F7F",
          })
        })

      //memasukan respon ke state
      this.setState({piechart_data:piechart_data, isLoading:false});
  }

  /*async getData() {
      this.setState({isLoading:true});

      //api url & parameter
      let apiurl = BaseUrl()+'/laporan/rekap_buku_perkategori';
      const options = {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
      };

      //memanggil server api
      fetch(apiurl, options)
      .then(response => {return response.json()})

      //response dari api
      .then(responseData => {
          //menangkap response api
          let data = responseData.data;

          //convert data api menjadi format chart
          let piechart_data = [];
          //looping dari data api
          data.map((row, index) => {

            //masukin data api ke format pie chart
            piechart_data.push({
              name: row.nama,
              value: parseInt(row.total_buku),
              color: this.getChartColor(index),
              legendFontColor: "#7F7F7F",
            })
            
          })

          //memasukan respon ke state untuk chart
          this.setState({piechart_data:piechart_data, isLoading:false});
      })
  }*/

  render() {
      return (
        <PaperProvider theme={Theme}>
          <Appbar.Header>
            <Appbar.Action icon="arrow-left" onPress={() => this.props.navigation.goBack()} />
            <Appbar.Content title="Rekap Buku per Kategori" />
          </Appbar.Header>

          {<PieChart
            data={this.state.piechart_data}
            width={Dimensions.get("window").width}
            height={250}
            chartConfig={{color: (opacity = 1) => `rgba(26, 255, 146, ${opacity})`,}}
            accessor={"value"}
            backgroundColor={"transparent"}
            paddingLeft={"15"}
            center={[10, 10]}
            absolute
          />}

          <Loading isLoading={this.state.isLoading} />

        </PaperProvider>
      )
  }
}

export default ChartPieScreen;