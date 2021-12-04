import type { NextPage } from "next";
import Head from 'next/head';
import DataTable from 'react-data-table-component';
import { useEffect, useState } from 'react';
import { promises as fs } from 'fs'
import path from 'path'

export interface DataRow {
  provider: string
  min_amount: string
  max_amount: string
  fee: string
  rate: string
  pair: string
  url: string
  name: string
}

const Home: NextPage = (props: any) => {

  const [tableData, setTableData] = useState<DataRow[]>([]);

  useEffect(() => {
    console.log(props.providers);
    getData();
  }, [])

  const getData = () => {
    props.providers.forEach(provider => {
      fetch(provider.getPairUrl)
        .then(response => response.json())
        .then(data => {
          let pairs = data.pairs;
          Object.entries(pairs).map(([key, value]: any) => {
            setTableData(tableData => [...tableData, {
              fee: value.fees.percentage + "%",
              max_amount: value.limits.maximal,
              min_amount: value.limits.minimal,
              pair: key,
              provider: provider.publicUrl,
              rate: value.rate,
              url: provider.getPairUrl,
              name: provider.name
            }]);
          });
        });
    })
  };

  const columns = [
    {
      name: 'Provider',
      cell: (row: DataRow) => <a className="inline-flex items-center h-8 px-4 m-2 text-sm text-indigo-100 transition-colors duration-150 bg-indigo-700 rounded-lg focus:shadow-outline hover:bg-indigo-800" href={row.provider}>{row.name}</a>,
      button: true,
      wrap: true,
      minWidth: '200px',
    },
    {
      name: 'Fee',
      selector: (row: DataRow) => row.fee,
      maxWidth: '30px',
      sortable: true,
    },
    {
      name: 'Max amount',
      selector: (row: DataRow) => row.max_amount,
      sortable: true,
    },
    {
      name: 'Min amount',
      selector: (row: DataRow) => row.min_amount,
      sortable: true,
    },
    {
      name: 'Pair',
      selector: (row: DataRow) => row.pair,
      maxWidth: '30px',
      sortable: true,
    },
    {
      name: 'Rate',
      selector: (row: DataRow) => row.rate,
      maxWidth: '200px',
      sortable: true,
    }
  ];

  return (
    <div>
      <Head>
        <title>Lightning bridge marketplace</title>
        <meta name="description" content="Lightning bridge marketplace" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h2 className="text-5xl text-center mt-36">
          Lightning bridge marketplace
        </h2>

        <p className="text-xl mt-2 text-center max-w-5xl m-auto">
          This website is collection of Lightning bridges. You can find here all the information about the providers and the pairs.

        </p>

        <div className="max-w-5xl m-auto">
          <DataTable columns={columns} data={tableData} highlightOnHover />
        </div>
        <p className="text-sm mt-2 text-center max-w-5xl m-auto">
          To run your own instance, clone this repo: <a className="text-indigo-500 hover:text-indigo-700" href=" https://github.com/pseudozach/lnsovbridge">Lnsovbridge </a>
          <br></br>
          Get your instance posted here, create PR here: <a className="text-indigo-500 hover:text-indigo-700" href="https://github.com/grmkris/lightning-bridges-aggregator/blob/main/bridge-providers.json">Bridge Providers </a>
        </p>
      </main>

      <footer>
      </footer>
    </div>
  )
}

// This function gets called at build time on server-side.
// It won't be called on client-side, so you can even do
// direct database queries. See the "Technical details" section.
export async function getStaticProps(): Promise<{ props: { providers: any[] } }> {
  const filePath = path.join(process.cwd(), 'bridge-providers.json');
  const fileContents = await fs.readFile(filePath, 'utf8');
  var providers = JSON.parse(fileContents);

  // By returning { props: { providers } }, the Home component
  // will receive `providers` as a prop at build time
  return {
    props: {
      providers: await Promise.all(providers),
    },
  }
}

export default Home
