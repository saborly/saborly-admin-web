// middleware/languageMiddleware.js
const detectLanguage = (req, res, next) => {
  const validLangs = ['en', 'es', 'ca', 'ar'];
  let lang = req.headers['accept-language'] || 'en';
  
  // Normalize language code
  lang = lang.split(',')[0].split('-')[0].toLowerCase();
  req.language = validLangs.includes(lang) ? lang : 'en';
  next();
};

const localizeResponse = async (req, res, next) => {
  const originalJson = res.json;
  res.json = function (data) {
    if (data.categories) {
      data.categories = data.categories.map(category => 
        category.getLocalized ? category.getLocalized(req.language) : category
      );
    }
    if (data.items) {
      data.items = data.items.map(item => 
        item.getLocalized ? item.getLocalized(req.language) : item
      );
    }
    if (data.category) {
      data.category = data.category.getLocalized ? data.category.getLocalized(req.language) : data.category;
    }
    if (data.item) {
      data.item = data.item.getLocalized ? data.item.getLocalized(req.language) : data.item;
    }
    return originalJson.call(this, data);
  };
  next();
};