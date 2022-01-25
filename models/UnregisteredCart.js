module.exports = function UnregisteredCart(oldCart) {
      this.items = oldCart.items || {};
      this.totalQty = oldCart.totalQty || 0;
    this.totalPrice = oldCart.totalPrice || 0;
    

      this.add = function(item, id, size) {
        let storedItem = this.items[id];
        if (!storedItem) {
            storedItem = this.items[id] = {item: item, item_id: item.id, name: item.name, image: item.main_image, size: size, qty: 0, price: 0};
        }
        console.log(item)
        storedItem.qty++;
        storedItem.price = storedItem.item.price.base * storedItem.qty;
        this.totalQty++
        this.totalPrice += storedItem.item.price.base
        
      }

      this.remove = function(item, id, size) {
        let storedItem = this.items[id];
        if (!storedItem) {
            storedItem = this.items[id] = {item: item, item_id: id, name: item.name, image: item.main_image, size: size, qty: 0, price: 0};
        }
        console.log(item)
        storedItem.qty--;
        storedItem.price = storedItem.item.price.base * storedItem.qty;
        this.totalQty--
        this.totalPrice -= storedItem.item.price.base
        
      }

      this.removeAll = function(item, id, size) {
        let storedItem = this.items[id];
        if (!storedItem) {
            storedItem = this.items[id] = {item: item, item_id: id, name: item.name, image: item.main_image, size: size, qty: 0, price: 0};
        }
        console.log(item)
        storedItem.qty = null;
        storedItem.price = storedItem.item.price.base * storedItem.qty;
        this.totalQty = storedItem.qty - this.totalQty;
        this.totalPrice = storedItem.price - this.totalPrice;
        
      }

      this.generateArray = function() {
          let arr = [];
          for (let id in this.items) {
              arr.push(this.items[id]);
          }
          return arr;
      }
};