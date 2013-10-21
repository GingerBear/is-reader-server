define(['jquery'], function($) {
        var formData;
        return {
            init: function(file) {
              formData = new FormData(file);
              console.log(formData);
            },
        }
    }
);