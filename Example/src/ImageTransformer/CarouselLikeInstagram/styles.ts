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
  heart: {
    width: 50,
    height: 50,
    backgroundColor: 'grey',
  },
  heartShape: {
    width: 30,
    height: 45,
    position: 'absolute',
    top: 0,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  leftHeart: {
    transform: [{ rotate: '-45deg' }],
    left: 5,
  },
  rightHeart: {
    transform: [{ rotate: '45deg' }],
    right: 5,
  },

  pacman: {
    marginLeft: 10,
    width: 0,
    height: 0,
    borderTopWidth: 10,
    borderTopColor: 'grey',
    borderLeftColor: 'grey',
    borderLeftWidth: 10,
    borderRightColor: 'transparent',
    borderRightWidth: 10,
    borderBottomColor: 'grey',
    borderBottomWidth: 10,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    borderBottomLeftRadius: 10,
  },

  talkBubble: {
    backgroundColor: 'transparent',
    marginLeft: 5,
  },
  talkBubbleSquare: {
    width: 20,
    height: 20,
    backgroundColor: 'grey',
    borderRadius: 10,
  },
  talkBubbleTriangle: {
    position: 'absolute',
    left: 9,
    top: 10,
    width: 0,
    height: 0,
    borderTopColor: 'transparent',
    borderTopWidth: 4,
    borderLeftWidth: 16,
    borderLeftColor: 'grey',
    borderBottomWidth: 4,
    borderBottomColor: 'transparent',
    transform: [{ rotate: '30deg' }],
  },

  coneContainer: {
    transform: [{ rotate: '63deg' }],
    top: -18,
    left: -12,
  },
  cone: {
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderLeftColor: 'transparent',
    borderRightWidth: 10,
    borderRightColor: 'transparent',
    borderBottomWidth: 20,
    borderBottomColor: 'grey',
  },
  coneBottom: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    top: 15,
    left: 0,
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderLeftColor: 'transparent',
    borderRightWidth: 10,
    borderRightColor: 'transparent',
    borderBottomWidth: 5,
    borderBottomColor: 'white',
  },

  flag: {
    marginRight: 10,
  },
  flagTop: {
    width: 18,
    height: 12,
    backgroundColor: 'grey',
  },
  flagBottom: {
    position: 'absolute',
    left: 0,
    bottom: 20,
    width: 0,
    height: 0,
    top: 12,
    borderBottomWidth: 10,
    borderBottomColor: 'transparent',
    borderLeftWidth: 9,
    borderLeftColor: 'grey',
    borderRightWidth: 9,
    borderRightColor: 'grey',
  },
});

export default s;
