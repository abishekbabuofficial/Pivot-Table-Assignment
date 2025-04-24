import { useState } from 'react'
import './App.css'
import FileUploader from './components/FileUploader'
import PivotTable from './components/PivotTable'
import SelectorPane from './components/SelectorPane'


function App() {
  //setting the states
  const [data, setData] = useState([]);
  const [rowFields, setRowFields] = useState([]);
  const [columnFields, setColumnFields] = useState([]);
  const [valueFields, setValueFields] = useState([]);
  const [aggregationType, setAggregationType] = useState({});

  
  return (
    <div className='flex flex-col items-center'>
      <FileUploader dataParsed = {setData}/>
      
      <div className='flex gap-4'>
        {data.length>0 &&<> <PivotTable 
        data = {data}
        rowFields={rowFields}
        columnFields={columnFields}
        valueFields={valueFields}
        aggregationType={aggregationType}/>

      <SelectorPane 
      uploadedData={data}
      rowFields={rowFields}
      columnFields={columnFields}
      valueFields={valueFields}
      aggregationType={aggregationType}
      setRowFields = {setRowFields}
      setColumnFields = {setColumnFields}
      setValueFields = {setValueFields}
      setAggregationType = {setAggregationType}
      />
      </>}
    </div>
    </div>
  )
}

export default App
