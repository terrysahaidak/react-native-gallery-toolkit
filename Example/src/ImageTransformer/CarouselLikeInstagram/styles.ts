import { StyleSheet } from 'react-native';

const s = StyleSheet.create({
  itemContainer: {
    backgroundColor: 'white',
  },
  itemHeader: {
    height: 45,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  itemPager: {},
  row: {
    flexDirection: 'row',
  },
  icon: {
    height: 27,
    width: 27,
    marginLeft: 10,
  },
  iconBookmark: {
    height: 27,
    width: 27,
    marginRight: 10,
  },
  image: {
    height: 30,
    width: 30,
    borderRadius: 15,
  },
  footerItem: {
    height: 70,
    zIndex: -1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  paginationContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: -19,
    zIndex: -1,
  },
});

export default s;
