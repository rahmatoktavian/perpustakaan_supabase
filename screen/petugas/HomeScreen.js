import React, { Component } from 'react';
import { View, Dimensions, ScrollView } from 'react-native';
import { Provider as PaperProvider, Appbar, Subheading, DataTable, Avatar, Portal, Modal, ActivityIndicator } from 'react-native-paper';
import { LineChart } from "react-native-chart-kit";

import supabase from '../../config/supabase';
import Theme from '../../config/Theme';
import storeApp from '../../config/storeApp';
import dateFormatDB from '../../component/dateFormatDB';
import Loading from '../../component/Loading';

class HomeScreen extends Component {

  constructor(props) {
      super(props);
      
      //redux variable
      this.state = storeApp.getState();  
      storeApp.subscribe(()=>{
        this.setState(storeApp.getState());
      });

      this.state = {
        ...this.state,
        labels: [],
        datalist: [0],
      }
  }

  componentDidMount() {
      this.getData();

      this._unsubscribe = this.props.navigation.addListener('focus', () => {
        this.getData();
      });
  }

  componentWillUnmount() {
    this._unsubscribe();
  }

  async getData() {
      this.setState({isLoading:true});

      const { data, error } = await supabase
                              .rpc('rekap_peminjaman')
        //convert data api menjadi format chart
        let labels = [];
        let datalist = [];
        data.map(row => {
          labels.push(dateFormatDB(row.tanggal_pinjam));
          datalist.push(row.total_pinjam);
        })

        //memasukan respon ke state untuk chart
        this.setState({data:data, labels:labels, datalist:datalist, isLoading:false});
  
  }

  onLogout() {
      //update redux
      storeApp.dispatch({
          type: 'LOGIN',
          payload: { isLogin:false, user_type:'', nim:'', petugas_id:'' }
      });
  }

  render() {
      return (
        <PaperProvider theme={Theme}>
          <Appbar.Header>
            <Appbar.Content title="Home" />
            <Appbar.Action icon="power" onPress={() => this.onLogout()} />
          </Appbar.Header>

          <ScrollView style={{backgroundColor:'white'}}>
            <Subheading style={{margin:20, color:Theme.colors.primary}}>Rekap Peminjaman Harian</Subheading>
            <LineChart
              data={{
                labels: this.state.labels,
                datasets: [ {data: this.state.datalist } ]
              }}
              width={Dimensions.get("window").width}
              height={325}
              chartConfig={{
                backgroundColor: "#000000",
                backgroundGradientFrom: "#ffffff",
                backgroundGradientTo: "#ffffff",
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(30, 144, 255, ${opacity})`,
                labelColor: (opacity = 1) =>  `rgba(30, 144, 255, ${opacity})`,
              }}
              verticalLabelRotation={45}
              bezier={true}
              style={{
                marginVertical:10,
                marginLeft:-25,
              }}
            />
            
            <DataTable>
              <DataTable.Header>
                <DataTable.Title>Tanggal</DataTable.Title>
                <DataTable.Title numeric>Total Peminjaman</DataTable.Title>
              </DataTable.Header>

              {/*loop data state*/}
              {this.state.data && this.state.data.map((row, key) => (
                <DataTable.Row key={key}>
                  <DataTable.Cell>{dateFormatDB(row.tanggal_pinjam)}</DataTable.Cell>
                  <DataTable.Cell numeric>{row.total_pinjam} Data</DataTable.Cell>
                </DataTable.Row>
              ))}
              {/*end loop*/}

            </DataTable>
          </ScrollView>

          <Loading isLoading={this.state.isLoading} />
        </PaperProvider>
      )
  }
}

export default HomeScreen;