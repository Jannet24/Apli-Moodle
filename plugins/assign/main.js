var templates = [
    "root/externallib/text!root/plugins/assign/view.html",
    "root/externallib/text!root/plugins/assign/viewDelivery.html",
    "root/externallib/text!root/plugins/assign/submissions.html"
];
var idAssign;
var grade;
define(templates, function (assignTpl,assignDeliveryTpl, submissionsTpl) {
    var plugin = {
        settings: {
            name: "assign",
            type: "mod",
            component: "mod_assign",
            lang: {
                component: "core"
            }
        },

        storage: {
            "assign_file": {type: "model"},
            "assign_files": {type: "collection", model: "assign_file"}
        },

        routes: [
            ["assign/view/:courseId/:cmid", "view_assign", "viewAssign"],
            ["assign/view/save", "save_cal", "addCalificacion"]
        ],

        sectionsCache: [],

         /**
         * Determines is the plugin is visible.
         * It may check Moodle remote site version, device OS, device type, etc...
         * This function is called when a alink to a plugin functinality is going to be rendered.
         *
         * @return {bool} True if the plugin is visible for the site and device
         */
        isPluginVisible: function() {
            // Check core services.
            var visible =   MM.util.wsAvailable('mod_assign_get_assignments') &&
                            MM.util.wsAvailable('mod_assign_get_submissions');

            return visible;
        },

        render: function(courseId, sectionId, section, module) {
            var data = {
                "courseId": courseId,
                "sectionId": sectionId,
                "section": section,
                "module": module
            };
            console.log("mis datos");
            console.log(data);
            // Store the section name.
            MM.plugins.assign.sectionsCache[module.contentid] = MM.util.formatText(section.name);

            return MM.tpl.render(MM.plugins.assign.templates.view.html, data);

        },

        perPage: 20,

        submissionsCache: null,

        /**
         * Display a assign
         * @param  {Number} cmid The course module number id
         *
         */
        viewAssign: function(courseId, cmid) {
            // Loading ....
            $("#info-" + cmid, "#principal").attr("src", "img/loadingblack.gif");

            // First, load the complete information of assigns in this course.
            var params = {
                "courseids[0]": courseId
            };

            MM.moodleWSCall("mod_assign_get_assignments",
                params,
                function(result) {
                    var course = result.courses.shift();
                    var currentAssign;
                    console.log("Curso 82");
                    console.log(course);
                    console.log("Curso Asssigmments");
                    console.log(course.assignments);
                    _.each(course.assignments, function(assign) {
                        console.log("assign 87");
                        console.log(assign);
                        if (assign.cmid == cmid) {
                            console.log("if assign");
                            console.log(assign);
                            currentAssign = assign;
                        }
                    });
                    console.log("Concurrent Asssign");
                    console.log(currentAssign);
                    if (currentAssign) { 
                        //manda la tarea a la vista 
                        MM.plugins.assign._showSubmissions(currentAssign);
                    }

                },
                null,
                function (error) {
                    MM.popErrorMessage(error);
                }
            );
        },

        _showGrades: function(assignId){

            console.log("Assign  "+assignId);
            var params = {
                "assignmentids[0]": assignId,
                "since": 0
            };

            console.log("Entro a grades");
            console.log("linea 122");
            MM.moodleWSCall("mod_assign_get_grades",
                params,
                function(result) {
                    console.log("Resultado de get_grades");
                    grade = result.assignments.shift();
                    console.log(grade);
                },
                null,
                function (error) {
                   console.log("Error de Grandes 125"+ error);
                }
            );
            console.log("Despues a grades");
            console.log(grade);
        },

        /**
         * Display submissions of a assign
         * @param  {Object} assign assign object
         *
         */
        _showSubmissions: function(assign) {
           MM.plugins.assign._showGrades(assign.id);
            /* var paramsGrades = {
                "assignmentids[0]": assign.id
            };

            console.log("Entro a grades");
            MM.moodleWSCall("mod_assign_get_grades",
                paramsGrades,
                function(result) {
                    console.log("Retorna grades: ");
                
                    data= result.assignments.shift();
                    console.log(data);
                },
                null,
                function (error) {
                   console.log("Error de Grandes 125"+ error);
                }
            );*/
            console.log("asiiiiiiiiiiiii")
            console.log(assign);
            console.log("LINEA 158");
        
            var params = {
                "assignmentids[0]": assign.id
            };


            MM.moodleWSCall("mod_assign_get_submissions",
                params,
                // Success callback.
                function(result) {
                    
                    console.log("Resultado de get_submissions");
                    console.log(result);
                    //se obtiene el id de la tabla de las tareas enviadas (4,5)
                    // Stops loading...
                    $("#info-" + assign.cmid, "#principal").attr("src", "img/info.png");
                    var siteId = MM.config.current_site.id;

                    var sectionName = "";
                    if (MM.plugins.assign.sectionsCache[assign.cmid]) {
                        sectionName = MM.plugins.assign.sectionsCache[assign.cmid];
                    }

                    var pageTitle = '<div id="back-arrow-title" class="media">\
                            <div class="img app-ico">\
                                <img src="img/mod/assign.png" alt="img">\
                            </div>\
                            <div class="bd">\
                                <h2>' + MM.util.formatText(assign.name) + '</h2>\
                            </div>\
                        </div>';

                         console.log(assign.id);
                    console.log("antes de ingresar grade")
                    console.log(grade);
                   
                    var data = {
                        "assign": assign, //3 
                        "sectionName": sectionName,
                        "activityLink": MM.config.current_site.siteurl + '/mod/assign/view.php?id=' + assign.cmid,
                        "submissions": [],
                        "users": {},
                        "grade": grade
                    };
                     console.log("LINEA 155");
                     console.log(data);
                    console.log(data.canviewsubmissions);
                    // Check if we can view submissions, with enought permissions.
                    if (result.warnings.length > 0 && result.warnings[0].warningcode == 1) {
                        console.log("Entro al IF 148");
                        data.canviewsubmissions = false;
                        console.log(data.canviewsubmissions);
                    } else {

                        data.canviewsubmissions = true;
                        data.submissions = result.assignments[0].submissions;
                        console.log("Entro al else");
                        console.log(data.canviewsubmissions);
                        console.log(data.submissions);
                    }

                    console.log("Antes del for 160");
                        console.log(assign.introattachments);
                    // Handle attachments.
                    for (var el in assign.introattachments) {
                         console.log("Entro al for");
                        var attachment = assign.introattachments[el];
                        console.log("attachment");
                        console.log(attachment);
                        assign.introattachments[el].id = assign.id + "-intro-" + el;
                        console.log(assign.introattachments[el]);
                        var uniqueId = MM.config.current_site.id + "-" + hex_md5(attachment.fileurl);
                        console.log(uniqueId);
                        var path = MM.db.get("assign_files", uniqueId);
                        console.log(path);
                        if (path) {

                            assign.introattachments[el].localpath = path.get("localpath");
                        }

                        var extension = MM.util.getFileExtension(attachment.filename);
                        if (typeof(MM.plugins.contents.templates.mimetypes[extension]) != "undefined") {
                            assign.introattachments[el].icon = MM.plugins.contents.templates.mimetypes[extension]["icon"] + "-64.png";
                        }
                    }

                    // Render the page if the user is likely an student.
                    if (! data.canviewsubmissions) {
                        console.log("Entro al if 223");
                        MM.plugins.assign._renderSubmissionsPage(data, pageTitle);
                    } else {
                        // In this case, we would need additional information (like pre-fetching the course participants).
                        MM.plugins.participantes._loadParticipants(assign.course, 0, 0,
                            function(users) {

                                // Recover the users who has made submissions, we need to retrieve the full information later.
                                var userIds = [];
                                data.submissions.forEach(function(sub) {
                                    userIds.push(sub.userid);
                                });

                                // Save the users in the users table. We are going to need the user names.
                                var newUser;
                                users.forEach(function(user) {
                                    newUser = {
                                        'id': MM.config.current_site.id + '-' + user.id,
                                        'userid': user.id,
                                        'fullname': user.fullname,
                                        'profileimageurl': user.profileimageurl
                                    };
                                    MM.db.insert('users', newUser);
                                    if (userIds.indexOf(user.id) > -1) {
                                        console.log("Agrego Usuario");
                                        data.users[user.id] = newUser;
                                    }
                                });
                                // Render the submissions page.
                                console.log("Entro a 251");
                                console.log(data);
                                
                                console.log(assign.id);
                               
                                MM.plugins.assign._renderSubmissionsPage(data, pageTitle);
                            },
                            function(m) {
                                $("#info-" + assign.cmid, "#principal").attr("src", "img/info.png");
                                MM.popErrorMessage(error);
                            }
                        );
                    }
                },
                {
                    logging: {
                        method: 'mod_assign_view_grading_table',
                        data: {
                            assignid: assign.id
                        }
                    }
                },
                function (error) {
                    $("#info-" + assign.cmid, "#principal").attr("src", "img/info.png");
                    MM.popErrorMessage(error);
                }
            );
        },

        _renderSubmissionsPage: function(data, pageTitle) {

            MM.plugins.assign.submissionsCache = data.submissions;

            var html = MM.tpl.render(MM.plugins.assign.templates.submissions.html, data);
            console.log("DEspues de var html");
            $('#principal').html(html).trigger("create");



            // Handle intro files downloads.
            $(".assign-download", "#secundario").on(MM.clickType, function(e) {
                console.log("Entro a descargar Documento");
                e.preventDefault();
                e.stopPropagation();

                var url = $(this).data("downloadurl");
                console.log(url);
                var filename = $(this).data("filename");
                var attachmentId = $(this).data("attachmentid");

                MM.plugins.assign._downloadFile(url, filename, attachmentId);
            });

            console.log(".submission");

            // View submission texts.
            $(".submissiontext", "#principal").on(MM.clickType, function(e) {

                console.log("entro a onclick");
                
                e.preventDefault();
                e.stopPropagation();

                var submissionid = $(this).data("submissionid");
                var qualification = $(this).data("qualification");
                console.log(qualification);
                var submission = {};
                data.submissions.forEach(function(s) {
                    if (s.id == submissionid) {
                        submission = s;
                        console.log("Es la s");
                        console.log(s.id);
                        console.log(submission);
                    }
                })
                var text = MM.plugins.assign._getSubmissionText(submission);
                //MM.widgets.renderIframeModalContents(pageTitle, text);
                idAssign= data.assign.id;
                console.log("antes de Renderizar x");
                console.log(data);
                var dataP = {
                    "title": pageTitle,
                    "text": text,
                    "qualification": qualification
                };
               // dataP.RRR = "HOLAS";

                console.log("777775");
                console.log(dataP);
                var html = MM.tpl.render(MM.plugins.assign.templates.viewDelivery.html, dataP);

                $('#principal').html(html).trigger("create");

                $('#principal form').on('submit', function(e) {
                    e.preventDefault();
                    console.log("assign ID");
                    console.log(submission);
                    console.log(idAssign);
                    var data = {
                        "assignmentid":idAssign,
                        "userid": submission.userid,
                        "grade": $.trim($('#calificacion').val()),
                        "attemptnumber": -1,
                        "addattempt": 0,
                        "workflowstate": "graded",
                        "applytoall": 0,
                        "plugindata[assignfeedbackcomments_editor][text]":$.trim($('#comentario').val()),
                        "plugindata[assignfeedbackcomments_editor][format]":0,
                        "plugindata[files_filemanager]": 0

                        };
                console.log("antes llamar ");
            MM.moodleWSCall('mod_assign_save_grade', data, function(){
                 
                 MM.log("Guardando Calificaciones");
                   
                });
              })
                console.log("despues de Renderizar");
            });
        },
        addCalificacion: function(e){
            MM.log("Mostrando Calificaciones");  
            e.preventDefault();
          /*  var assignmentid = 2;
            var userid = 9;
            var grade = 70;
            var attemptnumber = -1;
            var addattemp = 0;
            var workflowstate ="graded";
            var applytoall = 0;

            var data = {
                "assignmentid":assignmentid,
                "userid": userid,
                "grade": grade,
                "attemptnumber": attemptnumber,
                "addattempt": addattemp,
                "workflowstate": workflowstate,
                "applytoall": applytoall,
                "plugindata[assignfeedbackcomments_editor][text]": "",
                "plugindata[assignfeedbackcomments_editor][format]":0,
                "plugindata[files_filemanager]": 0

                };

            MM.moodleWSCall('mod_assign_save_grade', data, function(tem){
                 
                 MM.log("Guardando Calificaciones");
                   
                });*/
            },

        _getSubmissionText: function(submission) {
            var text = '';
            if (submission.plugins) {
                submission.plugins.forEach(function(plugin) {
                    if (plugin.type == 'onlinetext' && plugin.editorfields) {
                        text = plugin.editorfields[0].text;

                        if (plugin.fileareas && plugin.fileareas[0] && plugin.fileareas[0].files && plugin.fileareas[0].files[0]) {
                            var fileURL =  plugin.fileareas[0].files[0].fileurl;
                            fileURL = fileURL.substr(0, fileURL.lastIndexOf('/')).replace('pluginfile.php/', 'pluginfile.php?token='+MM.config.current_token+'&file=/');
                            text = text.replace(/@@PLUGINFILE@@/g, fileURL);
                        }
                    }
                });
            }
            return text;
        },

        _getSubmissionFiles: function(submission) {
            var files = [];
            if (submission.plugins) {
                submission.plugins.forEach(function(plugin) {
                    if (plugin.type == 'file' && plugin.fileareas && plugin.fileareas[0] && plugin.fileareas[0].files) {
                        files = plugin.fileareas[0].files;
                    }
                });
            }
            // Find local path of files.
            if (files.length > 0) {
                    for (var el in files) {
                    var file = files[el];

                    files[el].id = submission.id + el;

                    var uniqueId = MM.config.current_site.id + "-" + hex_md5(file.fileurl);
                    var path = MM.db.get("assign_files", uniqueId);
                    if (path) {
                        files[el].localpath = path.get("localpath");
                    }

                    var extension = MM.util.getFileExtension(file.filepath);
                    if (typeof(MM.plugins.contents.templates.mimetypes[extension]) != "undefined") {
                        files[el].icon = MM.plugins.contents.templates.mimetypes[extension]["icon"] + "-64.png";
                    }
                }
            }
            return files;
        },

        _downloadFile: function(url, filename, attachmentId) {
            console.log("Descargar Archivo");

            // Add the token.
            var downloadURL = MM.fixPluginfile(url);
            var siteId = MM.config.current_site.id;
            var downCssId = $("#downimg-" + attachmentId);
            var linkCssId = $("#attachment-" + attachmentId);
            filename = MM.fs.normalizeFileName(filename);

            var directory = siteId + "/assign-files/" + attachmentId;
            var filePath = directory + "/" + filename;
            console.log(downloadURL +"  "+ siteId+" " +filePath + " "+ directory);
            

            MM.fs.init(function() {
                if (MM.deviceConnected()) {
                    MM.log("Starting download of Moodle file: " + downloadURL);
                    // All the functions are asynchronous, like createDir.
                    MM.fs.createDir(directory, function() {
                        MM.log("Downloading Moodle file to " + filePath + " from URL: " + downloadURL);

                        $(downCssId).attr("src", "img/loadingblack.gif");
                        MM.moodleDownloadFile(downloadURL, filePath,
                            function(fullpath) {
                                MM.log("Download of content finished " + fullpath + " URL: " + downloadURL);

                                var uniqueId = siteId + "-" + hex_md5(url);
                                var file = {
                                    id: uniqueId,
                                    url: url,
                                    site: siteId,
                                    localpath: fullpath
                                };
                                MM.db.insert("assign_files", file);

                                $(downCssId).remove();
                                $(linkCssId).attr("href", fullpath);
                                $(linkCssId).attr("rel", "external");
                                // Remove class and events.
                                $(linkCssId).removeClass("assign-download");
                                $(linkCssId).off(MM.clickType);

                                // Android, open in new browser
                                MM.handleFiles(linkCssId);
                                MM._openFile(fullpath);

                            },
                            function(fullpath) {
                                $(downCssId).remove();
                                MM.log("Error downloading " + fullpath + " URL: " + downloadURL);
                            }
                        );
                    });
                } else {
                    MM.popErrorMessage(MM.lang.s("errornoconnectednocache"));
                }
            });
        },

        templates: {
            "view": {
                html: assignTpl
            },
            "viewDelivery": {
                html: assignDeliveryTpl
            },
            "submissions": {
                html: submissionsTpl
            }
        }

    };

    MM.registrarPlugin(plugin);

});