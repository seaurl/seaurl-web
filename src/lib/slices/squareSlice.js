import {createAsyncThunk, createSlice} from '@reduxjs/toolkit'
import axios from "../axios";

export const getGithubData = createAsyncThunk('square/getListByLang', async (params, thunkAPI) => {
  try {
    console.log('params.lang=====', params.lang)
    const res = await axios.post(`/space/crud/getGithubData`, {
      lang: params.lang,
      pageNo: params.pageNo,
      param: params.param
    });
    console.log('getListByLang res=', res)

    if (res.data){
      return res.data
    }
    return null
  } catch (error) {
    return thunkAPI.rejectWithValue({errorMsg: error.message});
  }
});

export const getMsnData = createAsyncThunk('square/getMsnData', async (params, thunkAPI) => {
  try {
    let url = `/space/crud/getMsnData/${params.tabId}/${params.pageNo}`
    console.log('getMsnData url=', url)
    const res = await axios.get(url);
    console.log('getMsnData res=', res)
    return res.data
  } catch (error) {
    return thunkAPI.rejectWithValue({errorMsg: error.message});
  }
});

const initialState = {
  tagList: [{
    key: '1',
    name: 'Python',
    code: 'Python'
  }, {
    key: '2',
    name: 'C',
    code: 'C'
  }, {
    key: '3',
    name: 'Java',
    code: 'Java'
  }, {
    key: '4',
    name: 'C++',
    code: 'C%2B%2B'
  }, {
    key: '5',
    name: 'C#',
    code: 'C%23'
  }, {
    key: '6',
    name: 'JavaScript',
    code: 'JavaScript'
  }, {
    key: '7',
    name: 'PHP',
    code: 'PHP'
  }, {
    key: '8',
    name: 'Go',
    code: 'Go'
  }, {
    key: '9',
    name: 'Swift',
    code: 'Swift'
  }, {
    key: '10',
    name: 'Ruby',
    code: 'Ruby'
  },
  //   {
  //   key: '11',
  //   name: 'VisualBasic',
  //   code: 'VisualBasic'
  // },
    {
      key: '12',
      name: 'Assembly',
      code: 'Assembly'
    },
    {
      key: '13',
      name: 'SQL',
      code: 'SQL'
    },
    {
      key: '14',
      name: 'Pascal',
      code: 'Pascal'
    },
    {
      key: '16',
      name: 'R',
      code: 'R'
    },
    {
      key: '17',
      name: 'Objective-C',
      code: 'Objective-C'
    },
    {
      key: '18',
      name: 'Perl',
      code: 'Perl'
    },
    {
      key: '19',
      name: 'Lua',
      code: 'Lua'
    },
    {
      key: '20',
      name: 'MATLAB',
      code: 'MATLAB'
    },
    {
      key: '21',
      name: 'Kotlin',
      code: 'Kotlin'
    },
    {
      key: '22',
      name: 'Rust',
      code: 'Rust'
    },
    // {
    //   key: '23',
    //   name: 'SAS',
    //   code: 'SAS'
    // },
    // {
    //   key: '24',
    //   name: 'Fortran',
    //   code: 'Fortran'
    // },
    // {
    //   key: '25',
    //   name: 'COBOL',
    //   code: 'COBOL'
    // },
    // {
    //   key: '26',
    //   name: 'Ada',
    //   code: 'Ada'
    // },
    // {
    //   key: '27',
    //   name: 'Prolog',
    //   code: 'Prolog'
    // },
    {
      key: '28',
      name: 'PowerShell',
      code: 'PowerShell'
    },
    // {
    //   key: '29',
    //   name: 'Julia',
    //   code: 'Julia'
    // },
    {
      key: '30',
      name: 'Dart',
      code: 'Dart'
    }
  ],
  chooseTag: null,
  loadingRankList: true
}

export const squareSlice = createSlice({
  name: 'square',
  initialState,
  reducers: {
    setChooseTag(state, action) {
      state.chooseTag = action.payload;
    },
  }
})

export const {setChooseTag} = squareSlice.actions
