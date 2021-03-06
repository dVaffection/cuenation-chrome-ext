'use strict';

define([
    'scripts/view/View',
    'scripts/view/Message',
    'scripts/view/Badge'
], function (View, Message, Badge) {
    function CuesView(container, messageView, user, userCueService, userCueCategoryService) {
        if (!(this instanceof CuesView)) {
            throw new Error('`this` must be an instance of view.CuesView');
        }

        View.call(this, container);

        var cuesView = this,
            badge = new Badge(userCueService);

        /**
         * @param {domain.Cue[]} cues
         * @param {domain.CueCategory[]} userCategories
         */
        function render(cues, userCategories) {
            var containerBody = document.createDocumentFragment(),
                dismissAllLink,
                cuesList,
                text;

            dismissAllLink = document.createElement('div');
            dismissAllLink.setAttribute('class', 'delete-all');
            dismissAllLink.innerText = '[Dismiss all]';

            cuesList = document.createElement('ul');
            cuesList.setAttribute('id', 'recent-cues');

            function createCuesListItem(cue) {
                var li,
                    a,
                    span,
                    whitespace;

                a = document.createElement('a');
                a.setAttribute('href', cue.link);
                a.setAttribute('target', '_blank');
                a.innerText = cue.title;

                span = document.createElement('span');
                span.setAttribute('class', 'delete');
                span.dataset.id = cue.id;
                span.innerText = '[Dismiss]';

                whitespace = document.createTextNode(' ');

                li = document.createElement('li');
                li.appendChild(a);
                li.appendChild(whitespace);
                li.appendChild(span);

                return li;
            }

            for (var i = 0; i < cues.length; i++) {
                cuesList.appendChild(createCuesListItem(cues[i]));
            }

            containerBody.appendChild(dismissAllLink);
            containerBody.appendChild(cuesList);


            container.innerHTML = '';

            if (0 === cues.length) {
                text = document.createElement('div');
                text.setAttribute('id', 'no-cues');

                if (0 === userCategories.length) {
                    text.innerText = 'You are not subscribed for any category yet!';
                } else {
                    text.innerText = 'No new cues :(';
                }
                container.appendChild(text);
            } else {
                container.appendChild(containerBody);
                listenToDelete(userCategories);
            }
        }

        function listenToDelete(userCategories) {
            var forEach = Array.prototype.forEach;

            // delete individual
            forEach.call(container.querySelectorAll('.delete'), function (el) {
                el.addEventListener('click', function (e) {
                    var ids = [this.dataset.id];

                    // upon clicking "dismiss" there are 2 strategies:
                    // - either we simply remove a link
                    // - or we re-render the whole layout (actually only in order not to duplicate "No new cues" message)
                    if (1 === container.querySelectorAll('.delete').length) {
                        render([], userCategories);
                    } else {
                        this.parentElement.remove();
                    }

                    userCueService.put(user.token, ids, function (err) {
                        if (err) {
                            messageView.show(Message.status.ERROR, err);
                        } else {
                            badge.render(user);
                        }
                    });
                });
            });

            // delete all
            container.querySelector('.delete-all').addEventListener('click', function (e) {
                var ids = [];

                forEach.call(container.querySelectorAll('.delete'), function (el) {
                    ids.push(el.dataset.id);
                });

                // re-render the whole layout (actually only in order not to duplicate "No new cues" message)
                render([], userCategories);

                userCueService.put(user.token, ids, function (err) {
                    if (err) {
                        messageView.show(Message.status.ERROR, err);
                    } else {
                        badge.render(user);
                    }
                });
            });
        }

        this.render = function () {
            cuesView.renderLoader();

            var _cues,
                _userCategories;

            function caller() {
                if (typeof _cues != 'undefined' && typeof _userCategories != 'undefined') {
                    render(_cues, _userCategories);
                }
            }

            userCueService.get(user.token, 0, function (err, cues, pageable) {
                if (err) {
                    messageView.show('error', err);
                } else {
                    _cues = cues;
                    caller();
                }
            });

            userCueCategoryService.get(user.token, function (err, userCategories) {
                if (err) {
                    messageView.show('error', err);
                } else {
                    _userCategories = userCategories;
                    caller();
                }
            });
        }
    }

    CuesView.prototype = Object.create(View.prototype);
    CuesView.prototype.constructor = CuesView;

    return CuesView;
});
