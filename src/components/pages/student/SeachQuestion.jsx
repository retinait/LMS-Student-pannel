import { AutoComplete, Spin } from 'antd';
import debounce from 'lodash/debounce';
import React, { useMemo, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import { getQuestionKeyword } from '../../../stateManager/reducers/qnaSlice';
import { set } from 'js-cookie';

const DebounceSelect = forwardRef(({ debounceTimeout = 800, setSearchString, setAutoCompleteText, ...props }, ref)=> {
  const [fetching, setFetching] = useState(false);
  const [value, setValue] = useState('');
  const [options, setOptions] = useState([]);
  const fetchRef = useRef(0);
    const history = useHistory();
  const debounceFetcher = useMemo(() => {
    const loadOptions = (value) => {
      fetchRef.current += 1;
      const fetchId = fetchRef.current;
      setOptions([]);
      setFetching(true);
     value && fetchUserList(value).then((newOptions) => {
        if (fetchId !== fetchRef.current) {
          // for fetch callback order
          return;
        }
        console.log('fetching done:', value);
        setOptions(newOptions);
        setFetching(false);
      }
        );
     //fetch and set options
    };
    return debounce(loadOptions, debounceTimeout);
  }, [debounceTimeout]);

  const clearSelection = () => {
    setValue('');
    console.log('Selection cleared!');
  };

  useImperativeHandle(ref, () => ({
    clearSelection, // This will allow the parent to call this function
  }));
  return (
      
    <AutoComplete
      labelInValue
      filterOption={false}
      onSearch={debounceFetcher}
      value={value}
      onChange={(e) => {
        console.log('onChange:', e.value);
        setValue(e.value);
        setAutoCompleteText(e.value);
      }
        }
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          debounceFetcher.flush();
          setSearchString(value);
        } 
      }
        }
      notFoundContent={fetching ? <Spin size="small" /> : null}
      {...props}
      options={options}
      onSelect={(value) => {
        console.log('selected:', value);
        history.push(`/question-details/${value.key}`);

      }
        }
      
    >
    </AutoComplete>
  );
});

// Usage of DebounceSelect

async function fetchUserList(value) {
  console.log('fetching question', value);
  return getQuestionKeyword(value)
    .then((body) =>
      body.data.map((q) => ({
        label: `${q.questionDescription}`,
        value: q._id,
      })),
    );
}
// const App = () => {
//   const [value, setValue] = useState([]);
//   return (
   
//   );
// };
export default DebounceSelect;