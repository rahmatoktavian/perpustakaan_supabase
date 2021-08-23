import React, { Component } from 'react';
import { View, ScrollView, Text } from 'react-native';
import { Provider as PaperProvider, Appbar, Avatar, DataTable, Portal, Modal, ActivityIndicator, Button, Subheading, } from 'react-native-paper';

import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing'

import supabase from '../../../config/supabase';
import Theme from '../../../config/Theme';
import Loading from '../../../component/Loading';

class SupaReportSummaryScreen extends Component {

  constructor(props) {
      super(props);

      this.state = {
        data: []
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

  async getData() {
      this.setState({isLoading:true});

      //query data supabase
      const { data, error } = await supabase
                                    .rpc('rekap_buku_perkategori')

      //looping untuk menghitung total
      let total = 0;
      data.map(row => {
        total += parseInt(row.total_buku);
      })

      //memasukan respon ke state
      this.setState({data:data, total:total, isLoading:false});
  }

  async onExportPDF() {
    let content = '';

    content += '<h3 style="text-align:center;">Rekap Buku per Kategori</h3>';
    content += '<table style="width:100%;">';

    content += '<tr>';
      content += '<td><strong>Kategori</strong></td>';
      content += '<td><strong>Total Buku</strong></td>';
    content += '</tr>';

    this.state.data && this.state.data.map(row => {
      content += '<tr>';
        content += '<td>'+row.nama+'</td>';
        content += '<td>'+row.total_buku+'</td>';
      content += '</tr>';
    })
    content += '<tr>';
      content += '<td>Total</td>';
      content += '<td>'+this.state.total+'</td>';
    content += '</tr>';

    content += '</table>';
    content += '<style>th, td {border: 1px solid black;border-collapse: collapse;}</style>';

    let response = await Print.printToFileAsync({
      html: content
    });

    Sharing.shareAsync(response.uri);
  }

  render() {
      return (
        <PaperProvider theme={Theme}>
          <Appbar.Header>
            <Appbar.Action icon="arrow-left" onPress={() => this.props.navigation.goBack()} />
            <Appbar.Content title="Rekap Buku per Kategori" />
          </Appbar.Header>

          <ScrollView>
          <DataTable>
            <DataTable.Header>
              <DataTable.Title>Kategori</DataTable.Title>
              <DataTable.Title numeric>Total Buku</DataTable.Title>
            </DataTable.Header>

            {/*loop data state*/}
            {this.state.data && this.state.data.map((row, key) => (
              <DataTable.Row key={key}>
                <DataTable.Cell>{row.nama}</DataTable.Cell>
                <DataTable.Cell numeric>{row.total_buku}</DataTable.Cell>
              </DataTable.Row>
            ))}
            {/*end loop*/}

            <DataTable.Row>
                <DataTable.Cell><Subheading style={{fontWeight:'bold'}}>Total</Subheading></DataTable.Cell>
                <DataTable.Cell numeric><Subheading>{this.state.total}</Subheading></DataTable.Cell>
            </DataTable.Row>

          </DataTable>
          </ScrollView> 

          {/*export pdf*/}
          {this.state.data &&
          <Button 
              mode="outlined" 
              icon="download" 
              onPress={() => this.onExportPDF()}
              style={{margin:20}}
          >
            Export PDF
          </Button>
          }

          <Loading isLoading={this.state.isLoading} />
        </PaperProvider>
      )
  }
}

export default SupaReportSummaryScreen;