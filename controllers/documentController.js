var Document = require('../models/document');
var models = require('../models');
var async = require('async');

const { check, validationResult } = require('express-validator/check')

// Display document create form on GET.
exports.document_create_get = async function(req, res, next) {
        const employees = await models.Employee.findAll();
        const types = await models.Type.findAll();
        const applications = await models.Application.findAll();
        const categories = await models.Category.findAll();
        res.render('forms/document_form', { title: 'Create Document', employees: employees, types: types, applications: applications, categories: categories, layout: 'layouts/detail'});
        console.log("document form renders successfully");
};


// Handle document create on POST.
exports.document_create_post = async function(req, res, next) {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const employees = await models.Employee.findAll();
      const types = await models.Type.findAll();
      const applications = await models.Application.findAll();

      const alert = errors.array();
      console.log(alert);
      res.render('forms/document_form', { title: 'Create Document', alert, employees: employees, types: types, applications: applications, layout: 'layouts/detail'});
    } else {
      
      // let status_name = 'Draft';
      const document = await models.Document.create({
            subject: req.body.subject,
            description: req.body.description,
            EmployeeId: req.body.employee_id,
            TypeId: req.body.type_id,
            ApplicationId: req.body.application_id,
            Status: req.body.status_name
        });

        let categoryList = req.body.categories;
          if (categoryList.length == 1) {
            const category = await models.Category.findById(req.body.categories);
            if (!category) {
              return res.status(400);
            }
            await document.addCategory(category);
          } else {
            await req.body.categories.forEach(async(id) => {
              const category = await models.Category.findById(id);
              if (!category) {
                return res.status(400);
              }
              await document.addCategory(category);
            });
          }
          res.redirect('/documents');

    }

};

// Handle document delete on POST.
exports.document_delete_post = async function(req, res, next) {
        const categories = await document.getCategories();
        document.removeCategories(categories);

        models.Document.destroy({
          where: {
            id: req.params.document_id
          }
        }).then(function() {
          res.redirect('/documents');
          console.log("Document deleted successfully");
        });

 };

// Display document update form on GET.
exports.document_update_get = async function(req, res, next) {
        console.log("ID is " + req.params.document_id);
        const employees = await models.Employee.findAll();
        const applications = await models.Application.findAll();
        const types = await models.Type.findAll();
        const categories = await models.Category.findAll();
        models.Document.findById(
                req.params.document_id
        ).then(function(document) {
               // renders a document form
               res.render('forms/document_form', { title: 'Update Document', document: document, employees: employees, applications: applications, types: types, categories: categories, layout: 'layouts/detail'});
               console.log("Document update get successful");
          });
        
};

// Handle document update on POST.
exports.document_update_post = async function(req, res, next) {
        console.log("ID is " + req.params.document_id);
        // logic to set document status
        // let status = 'Draft';

        const categories = await document.getCategories();
        document.removeCategories(categories);

        let categoryList = req.body.categories;
        if (categoryList.length == 1) {
          const category = await models.Category.findById(req.body.categories);
          if (!category) {
            return res.status(400);
          }
          await document.addCategory(category);
        } else {
          await req.body.categories.forEach(async(id) => {
            const category = await models.Category.findById(id);
            if (!category) {
              return res.status(400);
            }
            await document.addCategory(category);
          });
        }

        models.Document.update(
        // Values to update
            {
              subject: req.body.subject,
              description: req.body.description,
              TypeId: req.body.type_id,
              ApplicationId: req.body.application_id,
              
            },
          { // Clause
                where: 
                {
                    id: req.params.document_id
                }
            }
         ).then(function() { 
                res.redirect("/documents");  
                console.log("Document updated successfully");
          });
};

// Display detail page for a specific document.
exports.document_detail = function(req, res, next) {
        models.Document.findById(
                req.params.document_id, {
                  include: [
                    {
                      model: models.Employee,
                      attributes: ['id', 'first_name', 'last_name', 'role', 'department']
                    },
                    {
                      model: models.Type,
                      attributes: ['id', 'type_name']
                    },
                    {
                      model: models.Application,
                      attributes: ['id', 'app_name']
                    },
                    {
                      model: models.Category,
                      as: 'categories',
                      attributes: ['id', 'category_name'],
                      through: {
                        model: models.documentCategories,
                        as: 'documentCategories',
                        attributes: ['document_id', 'category_id']
                      }
                    }
                  ]
                }
        ).then(function(document) {
        // renders an inividual post details page
        res.render('pages/document_detail', { title: 'Document Details', document: document, layout: 'layouts/detail'} );
        console.log("Document details renders successfully...");
        });
};


// Display list of all documents.
exports.document_list = function(req, res, next) {
        models.Document.findAll(
        ).then(function(documents) {
          console.log("rendering document list");
          res.render('pages/document_list', { title: 'Document List', documents: documents, layout: 'layouts/list'} );
          console.log("Document list renders successfully...");
        });
        
};


// Change status GET
exports.change_status_get = function(req, res, next) {
  models.Document.findById(
    req.params.document_id
    ).then(function(document) { 

    res.render('forms/status_form', { title: 'Change Status', document: document, layout: 'layouts/detail'});
    console.log('Status form rendered successfully.')

    });

};

  // Change STATUS POST
exports.change_status_post = function(req, res, next) {
  // let status_name = '';
  models.Document.update({
    Status: req.body.status_name
  },
  {
    where: {
      id: req.params.document_id
    }
  }
  ).then (function() {
    res.redirect('/documents');
    
  }).catch(error => {
    console.log('There was an error: ' + error);
  })

};

// This is the blog homepage.
exports.index = function(req, res) {
      // find the count of posts in database
      models.Document.findAndCountAll(
      ).then(function(documentCount)
      {   
      models.Employee.findAndCountAll(
      ).then(function(employeeCount)
      {
      models.Application.findAndCountAll(
      ).then(function(applicationCount)
      {
      models.Type.findAndCountAll(
      ).then(function(typeCount)
      {
      models.Category.findAndCountAll(
      ).then(function(categoryCount)
      {
        res.render('pages/index', {
          title: 'Homepage', 
          documentCount: documentCount,
          employeeCount: employeeCount,
          applicationCount: applicationCount,
          typeCount: typeCount,
          categoryCount: categoryCount, 
          layout: 'layouts/main'
        }) 
      });
      });
      });
      });
      });
};
